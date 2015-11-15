import {window, commands, workspace} from 'vscode';
import * as embercli from './src/ember-cli';

export function activate() { 
	// Register Commands
	commands.registerCommand('extension.setupProject', () => embercli.setupProject());
	commands.registerCommand('extension.build', () => embercli.build());
	commands.registerCommand('extension.serve', () => embercli.serve());
}