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
	
	// ember addon
	public addon() {
		let addonOps = new emberOps.EmberOperation('addon', {
			isOutputChannelVisible: false
		});
		
		addonOps.run().then((result : emberOps.emberOperationResult) => {
			if (result && result.code === 0) {
				window.showInformationMessage('Addon folder structure created!');
			} else {
				window.showErrorMessage('Addon folder structure creation failed.');
			}
		});
	}
	
	// ember version
	public version() {
		let versionOps = new emberOps.EmberOperation('version', {
			isOutputChannelVisible: false
		});
		versionOps.run().then((result : emberOps.emberOperationResult) => {
			if (result.code === 0) {
				window.showInformationMessage('Ember Cli ' + result.stdout);
			}
		});
	}

	// ember install
	public install() {
		window.showInputBox({
			prompt: 'Name of the addon to install?'
		}).then((result) => {
			if (!result || result === '') return;
			let installOp = new emberOps.EmberOperation(['install', result]);
			installOp.run();
		});
	}

	// ember new
	public new() {
		window.showInputBox({
			prompt: 'Name of the new application?'
		}).then((result) => {
			if (!result || result === '') return;
			let newOp = new emberOps.EmberOperation(['new', result]);
			newOp.run();
			this.setupProject();
		})
	}

	// ember init
	public init() {
		let initOp = new emberOps.EmberOperation(['init']);
		initOp.run();
		this.setupProject();
	}

	// ember build
	public build() {
		let buildOp = new emberOps.EmberOperation('build');
		buildOp.run().then((result : emberOps.emberOperationResult) => {
			if (result.code === 0) {
				window.showInformationMessage('Project successfully built!');
			}
		});
	}

	// ember serve
	public serve() {
		if (this._cache.serveOperation) {
			this._cache.serveOperation.showOutputChannel();
		} else {
			this._cache.serveOperation = new emberOps.EmberOperation('serve');
			this._cache.serveOperation.run();
		}
	}

	// ember generate & ember destroy
	public blueprint(type : string) {
		if (!this._cache.generateChoices) {
			return this._cache.preload().then(() => this.blueprint(type));
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
			if (!result) return;

			let optionPromises = [];
			let optionResults = [];
			let gdName;

			if (result.anonymousOptions && result.anonymousOptions.length > 0) {
				for (var i = 0; i < result.anonymousOptions.length; i++) {
					var name = result.anonymousOptions[i];

					optionPromises.push(window.showInputBox({
						prompt: `${helpers.capitalizeFirstLetter(name)}?`
					}).then((promptResult) => {
						optionResults.push(promptResult);
						gdName = (i === 1) ? promptResult : gdName;
					}));
				}
			}

			Promise.all(optionPromises).then((results) => {
				let generateArgs = optionResults.join(' ');
				let blueprintOp = new emberOps.EmberOperation([type, result.label, generateArgs], {
					isOutputChannelVisible: false
				});
				blueprintOp.run().then((result : emberOps.emberOperationResult) => {
					if (result.code === 0) {
						let message = `${gdName} sucessfully ${(type === 'generate') ? 'generated' : 'destroyed'}!`;
						window.showInformationMessage(message);
					}
				});
			});
		});
	}

	// ember test
	public test() {
		let testOp = new emberOps.EmberOperation(['test']);
		testOp.run().then((result : emberOps.emberOperationResult) => {
			if (result && result.code === 0) {
				window.showInformationMessage('Tests passed with code ' + result.code);
			} else {
				window.showErrorMessage('Tests failed with error code ' + result.code);
			}
		});
	}

	// ember test (server)
	public testServer() {
		if (this._cache.testServeOperation) {
			this._cache.testServeOperation.kill();
		}

		this._cache.testServeOperation = new emberOps.EmberOperation(['test', '--server'], {
			isOutputChannelVisible: false
		});
		this._cache.testServeOperation.run();
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