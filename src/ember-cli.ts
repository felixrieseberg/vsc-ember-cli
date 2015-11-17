import {window, commands, workspace} from 'vscode';
import * as vscode from 'vscode';
import constants = require('./constants');
import fileOps = require('./file-ops');
import emberOps = require('./ember-ops');
import helpers = require('./helpers');
import cache = require('./dumb-cache');

export class EmberCliManager {
	private _cache : cache.DumbCache;
	
	constructor() {
		this._cache = new cache.DumbCache({preload: true});
	}
	
	// ember build
	public build() {
		let buildOp = new emberOps.EmberOperation('build');
	}
	
	// ember serve
	public serve() {
		if (this._cache.serveOperation) {
			this._cache.serveOperation.showOutputChannel();
		} else {
			this._cache.serveOperation = new emberOps.EmberOperation('serve');
		}
	}
	
	// ember generate & ember destroy
	public blueprint(type : string) {
		if (!this._cache.generateChoices) {
			this._cache.preload();
		}
		
		if (type !== 'generate' && type !== 'destroy') return;
		
		let qpChoices : Array<vscode.QuickPickItem> = this._cache.generateChoices.map((element) => {
			return {
				label: element.name,
				description: element.description,
				anonymousOptions: element.anonymousOptions,
				availableOptions: element.availableOptions
			}
		});
		
		window.showQuickPick(qpChoices, {
			placeHolder: `Which blueprint do you want to ${type}?`,
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
				new emberOps.EmberOperation([type, result.label, generateArgs], {
					showOutputChannel: false
				});
			});
		});
	}
	
	/*
	// Helper Functions 
	*/
	
	// Is the current project setup for Visual Studio Code?
	public isProjectSetup() : boolean {
		return false;
	}
	
	// Is the current project an Ember Cli project?
	public isProjectEmberCli() : boolean {
		return true;
	}
	
	// Set the project up
	public setupProject() : boolean {
		if (!workspace || !workspace.rootPath) return false;
		
		fileOps.appendVSCIgnore(constants.ignoreItems);
		fileOps.appendJSConfig(constants.jsConfig);
	}
}