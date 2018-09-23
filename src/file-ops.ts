import { workspace } from "vscode";
import * as fs from "fs";
import * as path from "path";

import { jsConfig } from "./constants";
import { getFullAppPath } from "./config";

// Generic imports
const pathExists = require("path-exists");
const merge = require("merge");

// Merges or overwrites settings in jsconfig.json
export function appendJSConfig(data): boolean {
    if (!workspace || !workspace.rootPath) {
        return false;
    }

    let jscPath = path.join(getFullAppPath(), "jsconfig.json");
    let newJsc, mergedJsc, currentJsc;

    // Check first if a jsconfig.json exists
    if (pathExists.sync(jscPath)) {
		let extensionConfig = workspace.getConfiguration('vsc-ember-cli');

		// If the file exists, but the user has requested no update,
		// go ahead and return now
		if (!extensionConfig.updateJSConfig) {
			return false;
		}

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

export function hasFile(file: string): boolean {
    if (!workspace || !workspace.rootPath) {
        return false;
    }

    return pathExists.sync(path.join(getFullAppPath(), file));
}
