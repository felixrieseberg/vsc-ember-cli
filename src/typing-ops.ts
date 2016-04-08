"use strict";

import { getEmberVersion } from "./ember-ops";
import { hasFile } from "./file-ops";
import { readSetting } from "./config";

import { window, commands, workspace } from "vscode";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";

const pathExists = require("path-exists");

export function installTypings(): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        if (!shouldInstallTypings()) return resolve();

        return getEmberVersion()
            .then((version) => installTypingsForVersion(version));
    });
}

function installTypingsForVersion(version: string): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        let typingsFolder = path.join(workspace.rootPath, "typings", "ember");
        let versionTypings = path.join(__dirname, "..", "..", "resources", "typings", `v${version}`, "ember.d.ts");
        let lastTypings = path.join(__dirname, "..", "..", "resources", "typings", "v2.4.4", "ember.d.ts");
        let typings;

        // Ensure we have typings for that version - otherwise, try the last one we have
        pathExists(versionTypings).then((exists) => {
            typings = (exists) ? versionTypings : lastTypings;

            // Ensure the target folder exists
            fs.ensureDir(typingsFolder, (err) => {
                if (err) return reject();

                // Then, copy it over
                fs.copy(typings, path.join(typingsFolder, "ember.d.ts"), (err) => {
                    if (err) return reject();

                    resolve();
                });
            });
        });
    });
}

function shouldInstallTypings(): boolean {
    let setting = readSetting("installTypings");
    let hasTypings = hasEmberTypings();
    let path = workspace.rootPath;

    if (!workspace || !workspace.rootPath || setting === false || hasTypings) {
        return false;
    }

    return true;
}

function hasEmberTypings(): boolean {
    return hasFile(path.join(workspace.rootPath, "typings", "ember", "ember.d.ts"));
}