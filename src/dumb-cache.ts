import emberOps = require('./ember-ops');

export class DumbCache {
	public generateChoices;
	public serveOperation : emberOps.EmberOperation;
	
	public preload() {
		this._preloadGenerateChoices();
	}
	
	constructor(options = { preload: false}) {
		if (options.preload) {
			this.preload();
		}
	}
	
	private _preloadGenerateChoices() {
		let rawChoices = emberOps.getHelp('generate');
		if (rawChoices && rawChoices.commands) {
			this.generateChoices = rawChoices.commands[0].availableBlueprints[0]['ember-cli'];
		} else {
			// Todo: Handle this
			return;
		}
	}
}