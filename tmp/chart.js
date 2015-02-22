"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Chart = (function () {
	function Chart(selection, chartOptions) {
		_classCallCheck(this, Chart);

		this.base = selection;
		this.hasDrawn = false;
		this._layers = {};
		this._attached = {};
		this._events = {};

		if (chartOptions && chartOptions.transform) {
			this.transform = chartOptions.transform;
		}
	}

	_prototypeProperties(Chart, null, {
		transform: {
			value: function transform(data) {
				return data;
			},
			writable: true,
			configurable: true
		},
		preDraw: {
			value: function preDraw() {},
			writable: true,
			configurable: true
		},
		postDraw: {
			value: function postDraw() {},
			writable: true,
			configurable: true
		},
		unlayer: {
			value: function unlayer(name) {
				var layer = this.layer(name);

				delete this._layers[name];
				delete layer._chart;

				return layer;
			},
			writable: true,
			configurable: true
		},
		layer: {
			value: function layer(name, selection, options) {
				var layer;

				if (arguments.length === 1) {
					return this._layers[name];
				}

				// we are reattaching a previous layer, which the
				// selection argument is now set to.
				if (arguments.length === 2) {
					if (typeof selection.draw === "function") {
						selection._chart = this;
						this._layers[name] = selection;
						return this._layers[name];
					} else {
						kotoAssert(false, "When reattaching a layer, the second argument " + "must be a d3.chart layer");
					}
				}

				layer = selection.layer(options);

				this._layers[name] = layer;

				selection._chart = this;

				return layer;
			},
			writable: true,
			configurable: true
		},
		attach: {
			value: function attach(attachmentName, chart) {
				if (arguments.length === 1) {
					return this._attached[attachmentName];
				}

				this._attached[attachmentName] = chart;
				return chart;
			},
			writable: true,
			configurable: true
		},
		draw: {
			value: function draw(rawData) {
				var layerName, attachmentName, attachmentData;

				var data = this.transform(rawData);

				this.preDraw(data);

				for (layerName in this._layers) {
					this._layers[layerName].draw(data);
				}

				for (attachmentName in this._attached) {
					if (this.demux) {
						attachmentData = this.demux(attachmentName, data);
					} else {
						attachmentData = data;
					}
					this._attached[attachmentName].draw(attachmentData);
				}

				this.hasDrawn = true;

				this.postDraw(data);
			},
			writable: true,
			configurable: true
		},
		on: {
			value: function on(name, callback, context) {
				var events = this._events[name] || (this._events[name] = []);
				events.push({
					callback: callback,
					context: context || this,
					_chart: this
				});
				return this;
			},
			writable: true,
			configurable: true
		},
		once: {
			value: function once(name, callback, context) {
				var self = this;
				var once = function () {
					self.off(name, once);
					callback.apply(this, arguments);
				};
				return this.on(name, once, context);
			},
			writable: true,
			configurable: true
		},
		off: {
			value: function off(name, callback, context) {
				var names, n, events, event, i, j;

				// remove all events
				if (arguments.length === 0) {
					for (name in this._events) {
						this._events[name].length = 0;
					}
					return this;
				}

				// remove all events for a specific name
				if (arguments.length === 1) {
					events = this._events[name];
					if (events) {
						events.length = 0;
					}
					return this;
				}

				// remove all events that match whatever combination of name, context
				// and callback.
				names = name ? [name] : Object.keys(this._events);
				for (i = 0; i < names.length; i++) {
					n = names[i];
					events = this._events[n];
					j = events.length;
					while (j--) {
						event = events[j];
						if (callback && callback === event.callback || context && context === event.context) {
							events.splice(j, 1);
						}
					}
				}

				return this;
			},
			writable: true,
			configurable: true
		},
		trigger: {
			value: function trigger(name) {
				var args = Array.prototype.slice.call(arguments, 1);
				var events = this._events[name];
				var i, ev;

				if (events !== undefined) {
					for (i = 0; i < events.length; i++) {
						ev = events[i];
						ev.callback.apply(ev.context, args);
					}
				}

				return this;
			},
			writable: true,
			configurable: true
		}
	});

	return Chart;
})();

module.exports = Chart;