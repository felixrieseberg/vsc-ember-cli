"use strict";

import { window, commands, workspace, OutputChannel } from "vscode";
import * as cp from "child_process";

import { capitalizeFirstLetter } from "./helpers";

export interface EmberOperationResult {
    code: Number;
    stdout: Array<string>;
    stderr: Array<string>;
}

export class EmberOperation {
    private _spawn = cp.spawn;
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

            this._oc = window.createOutputChannel(`Ember: ${capitalizeFirstLetter(this.cmd[0])}`);

            this._process = this._spawn("ember", this.cmd, {
                cwd: workspace.rootPath
            });

            if (this._isOutputChannelVisible || process.env.VSC_EMBER_CLI_DEBUG) {
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

                this._oc.appendLine(data);
                this._stdout.push(data);
                lastOut = out;
            });

            this._process.stderr.on("data", (data) => {
                this._oc.appendLine(data);
                this._stderr.push(data);
            });

            this._process.on("close", (code) => {
                this._oc.appendLine(`Ember ${this.cmd[0]} process exited with code ${code}`);
                if (this._isOutputChannelVisible) {
                    this._oc.hide();
                }

                resolve(<EmberOperationResult>{
                    code: parseInt(code),
                    stderr: this._stderr,
                    stdout: this._stdout
                });
            });
        });
    }

    constructor (cmd: string | Array<string>, options = { isOutputChannelVisible: true }) {
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
    try {
        let exec = cp.execSync("ember -v");

        console.log("Ember is apparently installed");
        console.log(exec.toString());

        return true;
    } catch (e) {
        return false;
    }
}

export function getHelp(cmd: string): any {
    return new Promise((resolve, reject) => {
        try {
            let exec = cp.execSync(`ember ${cmd} --help --json`);
            let result = exec.toString();

            // Clean input
            let jsonStart = result.indexOf("{");
            result = (jsonStart > 0) ? result.slice(jsonStart) : result;
            result = JSON.parse(result);

            resolve(result);
        } catch (e) {
            if (cmd === "generate") {
                // For generate, let"s use our fallback
                let generateFallback = require("../../json/generate.json");
                return resolve(generateFallback);
            }

            reject(e);
        }
    });
}