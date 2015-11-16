import {window, commands, workspace, OutputChannel} from 'vscode';
import cp = require('child_process');
import helpers = require('./helpers');

export class EmberOperation {
	private _spawn = cp.spawn;
	private _oc : OutputChannel;
	private _process : cp.ChildProcess;
	public created : boolean;
	
	public showOutputChannel () {
		if (this._oc) this._oc.show();
	}
	
	constructor (cmd: string | Array<string>, options = { showOutputChannel: true }) {
		if (!workspace || !workspace.rootPath) return;
		let cmdArgs : string[] = (Array.isArray(cmd)) ? cmd : [cmd];
			
		this._oc = window.createOutputChannel(`Ember: ${helpers.capitalizeFirstLetter(cmdArgs[0])} Project`);
		
		this._process = this._spawn('ember', cmdArgs, {
			cwd: workspace.rootPath
		});
		
		if (options.showOutputChannel) this._oc.show();
		
		this._process.stdout.on('data', (data) => {
			this._oc.appendLine(data);
		});
	
		this._process.stderr.on('data', (data) => {
			this._oc.appendLine(data);
		});
	
		this._process.on('close', (code) => {
			this._oc.appendLine(`Ember ${cmd} process exited with code ${code}`);
			this._oc.hide();
		});
		
		this.created = true;
	}
	
	dispose() {
		if (this._oc) this._oc.dispose();
		if (this._process) this._process.kill();
	}
}

export function isEmberCliInstalled() : boolean {
	try {
		let exec = cp.execSync('ember -v');

		console.log('Ember is apparently installed');
		console.log(exec.toString());

		return true;
	} catch (e) {
		return false;
	}
}

export function getHelp(cmd: string) : any {
	try {
		let exec = cp.execSync(`ember ${cmd} --help --json`);
		let result = exec.toString();
		
		// Clean input
		let jsonStart = result.indexOf('{');
		result = (jsonStart > 0) ? result.slice(jsonStart) : result;
		result = JSON.parse(result);

		return result;
	} catch (e) {
		return {
			error: e
		};
	}
}