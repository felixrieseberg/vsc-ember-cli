import {window, commands, workspace} from 'vscode';
import * as vscode from 'vscode';
import constants = require('./constants');
import fileOps = require('./file-ops');
import emberOps = require('./ember-ops');
import helpers = require('./helpers');

// Let's keep some references around
var serveOp : emberOps.EmberOperation;
var ghettoCache = {
	generateChoices: null
};



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

// ember generate
export function generate() {
	if (!ghettoCache.generateChoices) {
		let rawChoices = emberOps.getHelp('generate');
		if (rawChoices && rawChoices.commands) {
			ghettoCache.generateChoices = rawChoices.commands[0].availableBlueprints[0]['ember-cli'];
		} else {
			// Oh noes
			return;
		}
	}
	
	let qpChoices : Array<vscode.QuickPickItem> = ghettoCache.generateChoices.map((element) => {
		return {
			label: element.name,
			description: element.description,
			anonymousOptions: element.anonymousOptions,
			availableOptions: element.availableOptions
		}
	});
	
	window.showQuickPick(qpChoices, {
		placeHolder: 'Which blueprint do you want to generate?',
		matchOnDescription: true
	}).then((result : any) => {
		let optionPromises = [];
		let optionResults = [];
		
		if (result.anonymousOptions && result.anonymousOptions.length > 0) {
			for (var i = 0; i < result.anonymousOptions.length; i++) {
				var name = result.anonymousOptions[i];

				optionPromises.push(window.showInputBox({
					prompt: `${helpers.capitalizeFirstLetter(name)}?`
				}).then((promptResult) => {
					optionResults.push(promptResult);
				}));
			}
		}
		
		Promise.all(optionPromises).then((results) => {
			let generateArgs = optionResults.join(' ');
			new emberOps.EmberOperation(['generate', result.label, generateArgs], {
				showOutputChannel: false
			});
		});
	});
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