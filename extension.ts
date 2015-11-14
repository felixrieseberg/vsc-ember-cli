import {window, commands, workspace} from 'vscode';
import * as embercli from './src/ember-cli';

export function activate() { 
	// Register Commands
	commands.registerCommand('extension.setupProject', () => embercli.setupProject());
}