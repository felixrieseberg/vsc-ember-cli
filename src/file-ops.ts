import { workspace } from "vscode";
import * as fs from "fs";
import * as path from "path";

import { jsConfig } from "./constants";
import { getFullAppPath } from "./config";

// Generic imports
const pathExists = require("path-exists");
const merge = require("merge");
import { EOL } from "os";

// Merges or overwrites settings in jsconfig.json
export function appendJSConfig(data): boolean {
    if (!workspace || !workspace.rootPath) {
        return false;
    }

    let jscPath = path.join(getFullAppPath(), "jsconfig.json");
    let newJsc, mergedJsc, currentJsc;

    // Check first if a jsconfig.json exists
    if (pathExists.sync(jscPath)) {
        // Merge
        try {
            currentJsc = JSON.parse(fs.readFileSync(jscPath, "utf8"));
            mergedJsc = merge(currentJsc, data);
        } catch (e) {
            console.log(e);
        }
    }

    // Write new config
    try {
        newJsc = mergedJsc || jsConfig;
        fs.writeFileSync(jscPath, JSON.stringify(newJsc), "utf8");
    } catch (e) {
        return false;
    }
}

// Appends the current project"s .vscodeignore file with additional items
export function appendVSCIgnore(ignoreItems: Array<string>): boolean {
    if (!ignoreItems || ignoreItems.length === 0 || !workspace || !workspace.rootPath) {
        return false;
    }

    let vsciPath = path.join(getFullAppPath(), ".vscodeignore");
    let eol = EOL || (process.platform === "win32" ? "\r\n" : "\n");

    // Let"s first see if the file already exists - and if so,
    // which items we have to fill in
    if (pathExists.sync(vsciPath)) {
        let vsciBuffer = fs.readFileSync(vsciPath);
        let vsciContent = vsciBuffer.toString().split(/\r?\n/);

        // If there"s anything in that file, we"ll need to add a newline
        if (vsciContent.length > 0) {
            ignoreItems.unshift("");
        }
        // Compare items to ignore and the current .vscodeignore items
        for (let i = 0; i < vsciContent.length; i++) {
            for (let ii = 0; ii < ignoreItems.length; ii++) {
                if (vsciContent[i] === ignoreItems[ii]) {
                    ignoreItems.splice(ii, 1);
                }
            }
        }
    }

    // Now, let's append the .vscodeignore
    let ignoreContent = ignoreItems.join(eol);

    try {
        fs.appendFileSync(vsciPath, ignoreContent, "utf8");
        return true;
    } catch (e) {
        return false;
    }
}

export function hasFile(file: string): boolean {
    if (!workspace || !workspace.rootPath) {
        return false;
    }

    return pathExists.sync(path.join(getFullAppPath(), file));
}
