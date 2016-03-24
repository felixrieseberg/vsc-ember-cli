"use strict";

import { EmberOperation, getHelp } from "./ember-ops";

export default class DumbCache {
    public generateChoices;
    public serveOperation: EmberOperation;
    public testServeOperation: EmberOperation;

    public preload(): Promise<any> {
        return this._preloadGenerateChoices();
    }

    constructor(options = { preload: false}) {
        if (options.preload) {
            this.preload();
        }
    }

    private _preloadGenerateChoices(): Promise<any> {
        return new Promise((resolve, reject) => {
            getHelp("generate").then((result) => {
                if (result && result.availableBlueprints) {
                    this.generateChoices = result.availableBlueprints[0]["ember-cli"];
                    resolve();
                } else {
                    // Todo: Handle this
                    reject();
                }
            });
        });
    }
}