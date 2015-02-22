import kotoAssert from './assert.js';

/**
 * Create a list of configurable options for an instance of a
 * {@link Chart}.
 *
 * @class
 *
 * @param {...Object[]} options The set of configurable options. Each option will
 *                              over-ride any previous options with the same name.
 * @param {string} options.description A breif description of the option.
 * @param {string} options.type The type of the vaule (string | number | boolean).
 * @param {string} options.value The default value for that config option.
 * @param {string} [options.units] If type is 'number', you can specify units.
 *
 */
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
	/**
	 * Get option with given name.
	 * @param  {string} name the name of the option.
	 * @return {Object}      The option definition of the option with given name.
	 */
	get(name) {
		kotoAssert(this._options[name], 'no option with that name');
		return this._options[name];
	}

	/**
	 * Set create of set option defintion with geven name (or key).
	 * @param {mixed} nameOrObject This can either be an object with key of option name(s)
	 *                             or, it can be a string with the option name.
	 * @param {Object} object      The option definition. Only used if used a named string
	 *                             as the first argument.
	 */
	set(nameOrObject, object) {
		var key;
		if (arguments.length === 1) {
			for (key in nameOrObject) {
				kotoAssert(this._options[key], 'no option with that name');
				this._options[key] = nameOrObject[key];
			}
		} else {
			kotoAssert(this._options[nameOrObject], 'no option with that name');
			this._options[nameOrObject] = object[key];
		}
		return this;
	}

	/**
	 * Remove an option item. This is helpful if you are inheriting from a chart
	 * and want to remove configurable options that have been inherited.
	 * @param  {string} name The name of the option definition you want to remove.
	 * @return {option}      Instance of {@link Option} (chainable).
	 */
	remove(name){
		delete this._options[name];
		return this;
	}
}
