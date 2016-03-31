"use strict";

import { window, commands, workspace } from "vscode";
import * as vscode from "vscode";

import { ignoreItems, jsConfig } from "./constants";
import { appendVSCIgnore, appendJSConfig } from "./file-ops";
import { EmberOperationResult, EmberOperation } from "./ember-ops";
import { capitalizeFirstLetter } from "./helpers";
import DumbCache from "./dumb-cache";

export class EmberCliManager {
    private _cache: DumbCache;

    constructor() {
        this._cache = new DumbCache({ preload: true });
    }

    // ember addon
    public addon() {
        let addonOps = new EmberOperation("addon", {
            isOutputChannelVisible: false
        });

        addonOps.run().then((result: EmberOperationResult) => {
            if (result && result.code === 0) {
                window.showInformationMessage("Addon folder structure created!");
            } else {
                window.showErrorMessage("Addon folder structure creation failed.");
            }
        });
    }

    // ember version
    public version() {
        let versionOps = new EmberOperation("version", {
            isOutputChannelVisible: false
        });
        versionOps.run().then((result: EmberOperationResult) => {
            if (result.code === 0) {
                window.showInformationMessage("Ember Cli " + result.stdout);
            }
        });
    }

    // ember install
    public install() {
        window.showInputBox({
            prompt: "Name of the addon to install?"
        }).then((result) => {
            if (!result || result === "") {
                return;
            };

            let installOp = new EmberOperation(["install", result]);
            installOp.run();
        });
    }

    // ember new
    public new() {
        window.showInputBox({
            prompt: "Name of the new application?"
        }).then((result) => {
            if (!result || result === "") {
                return;
            };

            let newOp = new EmberOperation(["new", result]);
            newOp.run();
            this.setupProject();
        });
    }

    // ember init
    public init() {
        let initOp = new EmberOperation(["init"]);
        initOp.run();
        this.setupProject();
    }

    // ember build
    public build() {
        let quickPickItems: Array<vscode.QuickPickItem> = [
            {
                label: "development",
                description: "Build with env=development"
            },
            {
                label: "production",
                description: "Build with env=production"
            }
        ];

        window.showQuickPick(quickPickItems).then((result) => {
            if (!result) {
                return;
            };

            let envarg = (result.label === "development") ? "-dev" : "-prod";
            let buildOp = new EmberOperation(["build", envarg]);
            buildOp.run().then((result: EmberOperationResult) => {
                if (result.code === 0) {
                    window.showInformationMessage("Project successfully built!");
                }
            });
        });
    }

    // ember serve
    public serve() {
        if (this._cache.serveOperation) {
            let quickPickItems: Array<vscode.QuickPickItem> = [
                {
                    label: "Show Output",
                    description: "Display the Ember Serve Task Output"
                },
                {
                    label: "Restart",
                    description: "Restart the serve process"
                },
                {
                    label: "Stop",
                    description: "Kill the serve process"
                }
            ];

            window.showQuickPick(quickPickItems).then((result) => {
                if (result.label === "Show Output") {
                    this._cache.serveOperation.showOutputChannel();
                } else if (result.label === "Stop") {
                    this._cache.serveOperation.kill();
                    this._cache.serveOperation.dispose();
                    this._cache.serveOperation = null;
                } else {
                    this._cache.serveOperation.kill();
                    this._cache.serveOperation.dispose();
                    this._cache.serveOperation = new EmberOperation("serve");
                    this._cache.serveOperation.run();
                }
            });
        } else {
            this._cache.serveOperation = new EmberOperation("serve");
            this._cache.serveOperation.run();
        }
    }

    // ember generate & ember destroy
    public blueprint(type: string) {
        if (!this._cache.generateChoices) {
            return this._cache.preload().then(() => this.blueprint(type));
        }

        if (type !== "generate" && type !== "destroy") {
            return;
        };

        let qpChoices: Array<vscode.QuickPickItem> = this._cache.generateChoices.map((element) => {
            return {
                label: element.name,
                description: element.description,
                anonymousOptions: element.anonymousOptions,
                availableOptions: element.availableOptions
            };
        });

        window.showQuickPick(qpChoices, {
            placeHolder: `Which blueprint do you want to ${type}?`,
            matchOnDescription: true
        }).then((result: any) => {
            if (!result) {
                return;
            };

            let optionPromises = [];
            let optionResults = [];
            let gdName;
            let i = 0;

            if (result.anonymousOptions && result.anonymousOptions.length > 0) {
                for (i = 0; i < result.anonymousOptions.length; i++) {
                    let name = result.anonymousOptions[i];

                    optionPromises.push(window.showInputBox({
                        prompt: `${capitalizeFirstLetter(name) }?`
                    }).then((promptResult) => {
                        optionResults.push(promptResult);
                        gdName = (i === 1) ? promptResult : gdName;
                    }));
                }
            }

            Promise.all(optionPromises).then((results) => {
                let generateArgs = optionResults.join(" ");
                let blueprintOp = new EmberOperation([type, result.label, generateArgs], {
                    isOutputChannelVisible: false
                });
                blueprintOp.run().then((result: EmberOperationResult) => {
                    if (result.code === 0) {
                        let message = `${gdName} sucessfully ${(type === "generate") ? "generated" : "destroyed"}!`;
                        window.showInformationMessage(message);
                    }
                });
            });
        });
    }

    // ember test
    public test() {
        let testOp = new EmberOperation(["test"]);
        testOp.run().then((result: EmberOperationResult) => {
            if (result && result.code === 0) {
                window.showInformationMessage("Tests passed with code " + result.code);
            } else {
                window.showErrorMessage("Tests failed with error code " + result.code);
            }
        });
    }

    // ember test (server)
    public testServer() {
        if (this._cache.testServeOperation) {
            let quickPickItems: Array<vscode.QuickPickItem> = [
                {
                    label: "Restart",
                    description: "Restart the serve process"
                },
                {
                    label: "Stop",
                    description: "Kill the serve process"
                }
            ];

            window.showQuickPick(quickPickItems).then((result) => {
                if (result.label === "Stop") {
                    this._cache.testServeOperation.kill();
                    this._cache.testServeOperation.dispose();
                    this._cache.testServeOperation = null;
                    window.showInformationMessage("Ember Cli: Test Server stopped");
                } else {
                    this._cache.testServeOperation.kill();
                    this._cache.testServeOperation.dispose();
                    this._cache.testServeOperation = new EmberOperation(["test", "--server"], {
                        isOutputChannelVisible: false
                    });
                    this._cache.testServeOperation.run();
                    window.showInformationMessage("Ember Cli: Test Server is running");
                }
            });
        } else {
            this._cache.testServeOperation = new EmberOperation(["test", "--server"], {
                isOutputChannelVisible: false
            });
            this._cache.testServeOperation.run();
            window.showInformationMessage("Ember Cli: Test Server is running");
        }
    }

    /*
    // Helper Functions
    */

    // Is the current project setup for Visual Studio Code?
    public isProjectSetup(): boolean {
        return false;
    }

    // Is the current project an Ember Cli project?
    public isProjectEmberCli(): boolean {
        return true;
    }

    // Set the project up
    public setupProject(): boolean {
        if (!workspace || !workspace.rootPath) {
            return false;
        }

        appendVSCIgnore(ignoreItems);
        appendJSConfig(jsConfig);
    }
}
