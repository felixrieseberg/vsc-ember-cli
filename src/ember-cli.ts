import {window, commands, workspace} from 'vscode';
import fileops = require('./fileops');
import constants = require('./constants');

// Generic imports
var pathExists = require('path-exists');

// Set the project up
export function setupProject() : boolean {
	if (!workspace || !workspace.rootPath) return false;
	
	fileops.appendVSCIgnore(constants.ignoreItems);
	fileops.appendJSConfig(constants.jsConfig);
}

// Is the current project setup for Visual Studio Code?
export function isProjectSetup() : boolean {
	return false;
}

// Is the current project an Ember Cli project?
export function isProjectEmberCli() : boolean {
	return true;
}