import {window, commands, workspace} from 'vscode';
import * as embercli from './src/ember-cli';
import * as emberOps from './src/ember-ops';

var emberManager : embercli.EmberCliManager;

export function activate() {
	if (!emberManager) emberManager = new embercli.EmberCliManager();
	
	// Ensure Ember Cli is installed 
	if (!emberOps.isEmberCliInstalled()) {
		window.showErrorMessage('Ember Cli is not installed');
	};
	
	// Register Commands
	commands.registerCommand('extension.setupProject', () => emberManager.setupProject());
	commands.registerCommand('extension.build', () => emberManager.build());
	commands.registerCommand('extension.serve', () => emberManager.serve());
	commands.registerCommand('extension.generate', () => emberManager.blueprint('generate'));
	commands.registerCommand('extension.destroy', () => emberManager.blueprint('destroy'));
}