import {window, commands, workspace} from 'vscode';
import * as embercli from './src/ember-cli';
import * as emberOps from './src/ember-ops';

export function activate() {
	// Ensure Ember Cli is installed 
	if (!emberOps.isEmberCliInstalled()) {
		window.showErrorMessage('Ember Cli is not installed');
	};
	
	// Register Commands
	commands.registerCommand('extension.setupProject', () => embercli.setupProject());
	commands.registerCommand('extension.build', () => embercli.build());
	commands.registerCommand('extension.serve', () => embercli.serve());
	commands.registerCommand('extension.generate', () => embercli.generate());
}