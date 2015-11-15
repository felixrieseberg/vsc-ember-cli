import {window, commands, workspace} from 'vscode';
import constants = require('./constants');
import fileOps = require('./file-ops');
import emberOps = require('./ember-ops');

// Let's keep some references around
var serveOp : emberOps.EmberOperation;

// Set the project up
export function setupProject() : boolean {
	if (!workspace || !workspace.rootPath) return false;
	
	fileOps.appendVSCIgnore(constants.ignoreItems);
	fileOps.appendJSConfig(constants.jsConfig);
}

// ember build
export function build() {
	let buildOp = new emberOps.EmberOperation('build');
}

// ember serve
export function serve() {
	if (serveOp) {
		serveOp.showOutputChannel();
	} else {
		serveOp = new emberOps.EmberOperation('serve');
	}
}

/*
// Helper Functions 
*/

// Is the current project setup for Visual Studio Code?
export function isProjectSetup() : boolean {
	return false;
}

// Is the current project an Ember Cli project?
export function isProjectEmberCli() : boolean {
	return true;
}