var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var kotoAssert = _interopRequire(require("./assert.js"));

var lifecycleRe = /^(enter|update|merge|exit)(:transition)?$/;

/**
 * Loop through handers and call them on selection
 * @param {d3.selection} selection The node to run the handler on.
 *                                  it could be an `d3.transition` selection
 * @param {lifecycle event} handlers A function to call for that layers named
 *                           				 lifecycle event.
 */
function selectionHandler(selection, handlers) {
	var idx, len;
	for (idx = 0, len = handlers.length; idx < len; ++idx) {
		// Attach a reference to the parent chart so the selection's
		// `chart` method will function correctly.
		selection._chart = handlers[idx].chart || this._base._chart;
		selection.call(handlers[idx].callback);
	}
}

/**
 * Create a layer using the provided `base`. The layer instance is *not*
 * exposed to d3.chart users. Instead, its instance methods are mixed in to the
 * `base` selection it describes; users interact with the instance via these
 * bound methods.
 *
 * @private
 * @class
 *
 * @param {d3.selection} base The containing DOM node for the layer.
 */

var Layer = (function () {
	function Layer(base) {
		_classCallCheck(this, Layer);

		this._base = base;
		this._handlers = {};
	}

	_prototypeProperties(Layer, null, {
		dataBind: {

			/**
    * Invoked by {@link Layer#draw} to join data with this layer's DOM nodes. This
    * implementation is "virtual"--it *must* be overridden by Layer instances.
    *
    * @param {Array} data Value passed to {@link Layer#draw}
    */

			value: function dataBind() {
				kotoAssert(false, "Layers must specify a dataBind method.");
			},
			writable: true,
			configurable: true
		},
		insert: {

			/**
    * Invoked by {@link Layer#draw} in order to insert new DOM nodes into this
    * layer's `base`. This implementation is "virtual"--it *must* be overridden by
    * Layer instances.
    */

			value: function insert() {
				kotoAssert(false, "Layers must specify an `insert` method.");
			},
			writable: true,
			configurable: true
		},
		on: {

			/**
    * Subscribe a handler to a "lifecycle event". These events (and only these
    * events) are triggered when {@link Layer#draw} is invoked--see that method
    * for more details on lifecycle events.
    *
    * @param {String} eventName Identifier for the lifecycle event for which to
    *        subscribe.
    * @param {Function} handler Callback function
    *
    * @returns {Chart} Reference to the layer instance (chaining).
    */

			value: function on(eventName, handler, options) {
				options = options || {};

				kotoAssert(lifecycleRe.test(eventName), "Unrecognized lifecycle event name specified to 'Layer#on': '" + eventName + "'.");

				if (!(eventName in this._handlers)) {
					this._handlers[eventName] = [];
				}
				this._handlers[eventName].push({
					callback: handler,
					chart: options.chart || null
				});
				return this;
			},
			writable: true,
			configurable: true
		},
		off: {

			/**
    * Unsubscribe the specified handler from the specified event. If no handler is
    * supplied, remove *all* handlers from the event.
    *
    * @param {String} eventName Identifier for event from which to remove
    *        unsubscribe
    * @param {Function} handler Callback to remove from the specified event
    *
    * @returns {Chart} Reference to the layer instance (chaining).
    */

			value: function off(eventName, handler) {

				var handlers = this._handlers[eventName];
				var idx;

				kotoAssert(lifecycleRe.test(eventName), "Unrecognized lifecycle event name specified to 'Layer#on': '" + eventName + "'.");

				if (!handlers) {
					return this._base;
				}

				if (arguments.length === 1) {
					handlers.length = 0;
					return this._base;
				}

				for (idx = handlers.length - 1; idx > -1; --idx) {
					if (handlers[idx].callback === handler) {
						handlers.splice(idx, 1);
					}
				}
				return this;
			},
			writable: true,
			configurable: true
		},
		draw: {

			/**
    * Render the layer according to the input data: Bind the data to the layer
    * (according to {@link Layer#dataBind}, insert new elements (according to
    * {@link Layer#insert}, make lifecycle selections, and invoke all relevant
    * handlers (as attached via {@link Layer#on}) with the lifecycle selections.
    *
    * - update
    * - update:transition
    * - enter
    * - enter:transition
    * - exit
    * - exit:transition
    *
    * @param {Array} data Data to drive the rendering.
    */

			value: function draw(data) {
				var bound, entering, events, selection, method, handlers, transitionHandlers, eventName;

				bound = this.dataBind.call(this._base, data);

				kotoAssert(bound instanceof d3.selection, "Invalid selection defined by `Layer#dataBind` method.");
				kotoAssert(bound.enter, "Layer selection not properly bound.");

				entering = bound.enter();
				entering._chart = this._base._chart;

				events = [{
					name: "update",
					selection: bound
				}, {
					name: "enter",
					selection: entering,
					method: this.insert
				}, {
					name: "merge",
					// Although the `merge` lifecycle event shares its selection object
					// with the `update` lifecycle event, the object's contents will be
					// modified when d3.chart invokes the user-supplied `insert` method
					// when triggering the `enter` event.
					selection: bound
				}, {
					name: "exit",
					// Although the `exit` lifecycle event shares its selection object
					// with the `update` and `merge` lifecycle events, the object's
					// contents will be modified when d3.chart invokes
					// `d3.selection.exit`.
					selection: bound,
					method: bound.exit
				}];

				for (var i = 0, l = events.length; i < l; ++i) {
					eventName = events[i].name;
					selection = events[i].selection;
					method = events[i].method;

					// Some lifecycle selections modify shared state, so they must be
					// deferred until just prior to handler invocation.
					if (typeof method === "function") {
						selection = method.call(selection);
					}

					if (selection.empty()) {
						continue;
					}

					// Although `selection instanceof d3.selection` is more explicit,
					// it fails in IE8, so we use duck typing to maintain
					// compatability.

					kotoAssert(selection && selection instanceof d3.selection, "Invalid selection defined for " + eventName + " lifecycle event.");

					handlers = this._handlers[eventName];

					if (handlers) {
						selectionHandler.call(this, selection, handlers);
					}

					transitionHandlers = this._handlers[eventName + ":transition"];

					if (handlers && handlers.length) {
						selection = selection.transition();
						selectionHandler.call(this, selection, transitionHandlers);
					}
				}
			},
			writable: true,
			configurable: true
		}
	});

	return Layer;
})();

module.exports = Layer;