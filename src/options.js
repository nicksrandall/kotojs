import kotoAssert from './assert.js';

export default class Options {
	constructor(...options) {
		var i, key;
		this._options = options[0];

		for (i=1; i<options.length; i++) {
			for(key in options[i]) {
				this._options[key] = options[i][key];
			}
		}

	}

	get(name) {
		kotoAssert(this._options[name].value, 'no option with that name');
		return this._options[name].value;
	}

	set(object) {
		var key;
		for (key in object) {
			this._options[key] = object[key];
		}
		return this;
	}

	remove(name){
		delete this._options[name];
		return this;
	}
}
