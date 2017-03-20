import { window, commands } from "vscode";
import * as embercli from "./src/ember-cli";
import * as emberOps from "./src/ember-ops";

var emberManager: embercli.EmberCliManager;
var installed: boolean = false;

export function activate() {
    execute("setupProject");

    // Register Commands
    commands.registerCommand("extension.addon", () => execute("addon"));
    commands.registerCommand("extension.setupProject", () => execute("setupProject"));
    commands.registerCommand("extension.build", () => execute("build"));
    commands.registerCommand("extension.serve", () => execute("serve"));
    commands.registerCommand("extension.init", () => execute("init"));
    commands.registerCommand("extension.new", () => execute("new"));
    commands.registerCommand("extension.install", () => execute("install"));
    commands.registerCommand("extension.generate", () => execute("blueprint", ["generate"]));
    commands.registerCommand("extension.destroy", () => execute("blueprint", ["destroy"]));
    commands.registerCommand("extension.version", () => execute('version'));
    commands.registerCommand("extension.test", () => execute("test"));
    commands.registerCommand("extension.testServer", () => execute("testServer"));
    commands.registerCommand("extension.installTypings", () => execute("installTypings"));
}

function execute(cmd?: string, arg?: Array<any>) {
    if (!emberManager) {
        emberManager = new embercli.EmberCliManager();
    }

    if (!cmd) {
        return;
    }

    emberOps.isEmberCliInstalled()
        .then(function () {
            installed = true;

            let ecmd = emberManager[cmd];
            if (typeof ecmd === 'function') {
                try {
                    ecmd.apply(emberManager, arg);
                } catch (e) {
                    // Well, clearly we didn't call a function
                    console.log(e);
                }
            }
        })
        .catch(function () {
            return window.showErrorMessage('Ember Cli is not installed');
        });
}
