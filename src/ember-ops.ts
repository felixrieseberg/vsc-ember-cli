import {window, commands, workspace, OutputChannel} from 'vscode';
import cp = require('child_process');

export class EmberOperation {
	private _spawn = cp.spawn;
	private _oc : OutputChannel;
	private _process : cp.ChildProcess;
	public created : boolean;
	
	public showOutputChannel () {
		if (this._oc) this._oc.show();
	}
	
	constructor (cmd: string) {
		if (!workspace || !workspace.rootPath) return;
		
		this._oc = window.createOutputChannel(`Ember: ${capitalizeFirstLetter(cmd)} Project`);
		
		this._process = this._spawn('ember', [cmd], {
			cwd: workspace.rootPath
		});
		
		this._oc.show();
		
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

// Helper
function capitalizeFirstLetter(input : string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}