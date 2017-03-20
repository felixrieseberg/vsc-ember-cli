import { window, workspace, OutputChannel } from "vscode";
import * as cp from "child_process";
import * as path from "path";

import { capitalizeFirstLetter, semver, versionDumpParse } from "./helpers";
import { getFullAppPath, getPathToEmberBin } from "./config";
import { hasFile } from "./file-ops";
import { spawn } from "cross-spawn";

export interface EmberOperationResult {
    code: Number;
    stdout: Array<string>;
    stderr: Array<string>;
}

export class EmberOperation {
    private _oc: OutputChannel;
    private _process: cp.ChildProcess;
    private _isOutputChannelVisible: boolean;
    private _stdout: Array<string> = [];
    private _stderr: Array<string> = [];

    public cmd: Array<string>;
    public created: boolean;

    public getStdout() {
        return this._stdout;
    }

    public getStderr() {
        return this._stderr;
    }

    public showOutputChannel() {
        if (this._oc) {
            this._oc.show();
            this._isOutputChannelVisible = true;
        }
    }

    public hideOutputChannel() {
        if (this._oc) {
            this._oc.dispose();
            this._oc.hide();
            this._isOutputChannelVisible = false;
        }
    }

    public kill() {
        if (this._process) {
            this._process.kill();
        }
    }

    public run() {
        return new Promise((resolve, reject) => {
            if (!workspace || !workspace.rootPath) {
                return reject();
            }

            let lastOut = "";
            let debugEnabled = process.env.VSC_EMBER_CLI_DEBUG || process.env["VSC EMBER CLI DEBUG"];
            let emberPath = getPathToEmberBin();

            this._oc = window.createOutputChannel(`Ember: ${capitalizeFirstLetter(this.cmd[0])}`);

            this._process = spawn(emberPath, this.cmd, {
                cwd: getFullAppPath()
            });

            this._oc.appendLine("Building...");

            if (this._isOutputChannelVisible || debugEnabled) {
                this._isOutputChannelVisible = true;
                this._oc.show();
            }

            this._process.stdout.on("data", (data) => {
                let out = data.toString();

                if (lastOut && out && (lastOut + "." === out)
                    || (lastOut.slice(0, lastOut.length - 1)) === out
                    || (lastOut.slice(0, lastOut.length - 2)) === out
                    || (lastOut.slice(0, lastOut.length - 3)) === out) {
                    lastOut = out;
                    return this._oc.append(".");
                }

                this._oc.appendLine(out);
                this._stdout.push(out);
                lastOut = out;
            });

            this._process.stderr.on("data", (data) => {
                let out = data.toString();
                this._oc.appendLine(out);
                this._stderr.push(out);
            });

            this._process.on("close", (code) => {
                this._oc.appendLine(`Ember ${this.cmd[0]} process exited with code ${code}`);

                resolve(<EmberOperationResult>{
                    code: code,
                    stderr: this._stderr,
                    stdout: this._stdout
                });
            });
        });
    }

    constructor(cmd: string | Array<string>, options = { isOutputChannelVisible: true }) {
        this._isOutputChannelVisible = options.isOutputChannelVisible;
        this.cmd = (Array.isArray(cmd)) ? cmd : [cmd];
        this.created = true;
    }

    dispose() {
        if (this._oc) {
            this._oc.dispose();
        }
        if (this._process) {
            this._process.kill();
        }
    }
}

export function isEmberCliInstalled(): boolean {
    let test = getEmberVersionDump();
    return test ? true : false;
}

/**
 * Returns ember -v console dump
 * 
 * @returns {string} 
 */
function getEmberVersionDump(): string {
    let emberBin = getPathToEmberBin();

    return spawn.sync(emberBin, ['-v']).output.toString();
}

var versionCache = false;
/**
 * Returns the versions from ember -v
 * [0] = ember version
 * [1] = node version
 * [2] = os info
 * 
 * @returns {Array<string>} 
 */
function getVersionsFromDump(): Array<string> {
    let matches;

    if (!versionCache) {
        let versionDump = getEmberVersionDump();
        matches = versionDumpParse().exec(versionDump);
        matches.shift();
        versionCache = matches;
    }
    else {
        matches = versionCache;
    }

    return matches;
}

export function getEmberVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
        let bower, bowerPath;

        if (!workspace || !workspace.rootPath) {
            return reject(new Error("Could not determine Ember version: Workspace not available."));
        }

        // Try go require the bower.json
        bowerPath = path.join(getFullAppPath(), "bower.json");
        if (hasFile(bowerPath)) {
            try {
                bower = require(bowerPath);
            } catch (error) {
                return reject(new Error("Could not determine Ember version: Bower.json not found."));
            }

            // Attempt to get to the ember version
            if (bower && bower.dependencies && bower.dependencies.ember) {
                let version = semver().exec(bower.dependencies.ember);

                if (version && version[0]) {
                    resolve(version[0]);
                } else {
                    return reject(new Error("Could not determine Ember version: Ember version not recognized."));
                }
            } else {
                return reject(new Error("Could not determine Ember version: Ember not a bower dependency."));
            }
        }
        // Get version from version dump
        else {
            let versions = getVersionsFromDump();
            return resolve(versions[0]);
        }
    });
}

export function getHelp(cmd: string): any {
    return new Promise((resolve, reject) => {
        try {
            let exec = cp.execSync(`ember --help --json`);
            let execOutput = exec.toString();
            let result = parseHelp(cmd, execOutput);

            resolve(result);
        } catch (e) {
            if (cmd === "generate") {
                // For generate, let"s use our fallback
                let generateFallback = require("../../resources/json/generate.json");
                return resolve(generateFallback);
            }

            reject(e);
        }
    });
}

function parseHelp(cmd: string, output: any): any {
    if (!output || !cmd) {
        return null;
    }

    // Clean input
    let jsonIndex: number = output.indexOf("{");
    let cleanedOutput: string = (jsonIndex > 0) ? output.slice(jsonIndex) : output;
    let help = JSON.parse(cleanedOutput);
    let cmdHelp: Object = null;

    if (help && help.commands) {
        cmdHelp = help.commands.find((item) => {
            return (item && item.name && item.name === cmd);
        });
    }

    return cmdHelp;
}
