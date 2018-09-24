import { workspace } from "vscode";
import * as path from "path";
import * as fs from "fs-extra";

const configPath = path.join(workspace.rootPath, ".vscode", "ember.json");
const merge = require("merge");
const pathExists = require("path-exists");

export function readSetting(key: string): any {
    let config = getConfig();

    if (config) {
        return config[key];
    } else {
        return null;
    }
}

// Unused?
export function writeSetting(data) {
    let currentConfig, mergedConfig, newConfig;
    // Check first if a jsconfig.json exists
    if (pathExists.sync(configPath)) {
        // Merge
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
            mergedConfig = merge(currentConfig, data);
        } catch (e) {
            console.log(e);
        }
    }

    // Write new config
    try {
        newConfig = mergedConfig || data;
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, "  "), "utf8");
        return true;
    } catch (e) {
        return false;
    }
}

function getConfig() {
    let config;

    if (!workspace || !workspace.rootPath) {
        return null;
    }

    try {
        config = require(configPath);
        return config;
    } catch (err) {
        return null;
    }
}

export function getFullAppPath(): string {
    const appPath = readSetting("appPath") || "./";
    return path.join(workspace.rootPath, appPath);
}

export function getPathToEmberBin(): string {
    const appPath = getFullAppPath();
    const localEmber = path.join(appPath, "node_modules/.bin/ember");

    try {
        const stats = fs.statSync(localEmber);
        return stats ? localEmber : "ember";
    } catch (error) {
        return "ember";
    }
}
