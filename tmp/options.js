"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Options = (function () {
	function Options() {
		for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}

		_classCallCheck(this, Options);

		var i, key;
		this._options = options[0];

		for (i = 1; i < options.length; i++) {
			for (key in options[i]) {
				this._options[key] = options[i][key];
			}
		}
	}

	_prototypeProperties(Options, null, {
		get: {
			value: function get(name) {
				return this._options[name].value;
			},
			writable: true,
			configurable: true
		},
		set: {
			value: function set(object) {
				var key;
				for (key in object) {
					this._options[key] = object[key];
				}
				return this;
			},
			writable: true,
			configurable: true
		},
		remove: {
			value: function remove(name) {
				delete this._options[name];
				return this;
			},
			writable: true,
			configurable: true
		}
	});

	return Options;
})();

module.exports = Options;