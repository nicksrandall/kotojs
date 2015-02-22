var lifecycleRe = /^(enter|update|merge|exit)(:transition)?$/;

export default class Layer {
	constructor(base) {
		this._base = base;
		this._handlers = {};
	}

	dataBind() {
		kotoAssert(false, 'Layers must specify a dataBind method.');
	}

	insert() {
		kotoAssert(false, 'Layers must specify an `insert` method.');
	}

	on(eventName, handler, options) {
		options = options || {};

		kotoAssert(lifecycleRe.test(eventName),
			'Unrecognized lifecycle event name specified to `Layer#on`: \'${eventName}\'.');

		if (!(eventName in this._handlers)) {
			this._handlers[eventName] = [];
		}
		this._handlers[eventName].push({
			callback: handler,
			chart: options.chart || null
		});
		return this._base;
	}

	off(eventName, handler) {

		var handlers = this._handlers[eventName];
		var idx;

		kotoAssert(lifecycleRe.test(eventName),
			'Unrecognized lifecycle event name specified to `Layer#on`: \'${eventName}\'.');

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
		return this._base;
	}

	draw(data) {
		var bound, entering, events, selection, method, handlers, eventName, idx, len;

		bound = this.dataBind.call(this._base, data);

		// Although `bound instanceof d3.selection` is more explicit, it fails
		// in IE8, so we use duck typing to maintain compatability.

		// d3cAssert(bound && bound.call === d3.selection.prototype.call,
		//   'Invalid selection defined by `Layer#dataBind` method.');
		// d3cAssert(bound.enter, 'Layer selection not properly bound.');

		entering = bound.enter();
		entering._chart = this._base._chart;

		events = [
			{
				name: 'update',
				selection: bound
			},
			{
				name: 'enter',
				selection: entering,
				method: this.insert
			},
			{
				name: 'merge',
				// Although the `merge` lifecycle event shares its selection object
				// with the `update` lifecycle event, the object's contents will be
				// modified when d3.chart invokes the user-supplied `insert` method
				// when triggering the `enter` event.
				selection: bound
			},
			{
				name: 'exit',
				// Although the `exit` lifecycle event shares its selection object
				// with the `update` and `merge` lifecycle events, the object's
				// contents will be modified when d3.chart invokes
				// `d3.selection.exit`.
				selection: bound,
				method: bound.exit
			}
		];

		for (var i = 0, l = events.length; i < l; ++i) {
			eventName = events[i].name;
			selection = events[i].selection;
			method = events[i].method;

			// Some lifecycle selections modify shared state, so they must be
			// deferred until just prior to handler invocation.
			if (typeof method === 'function') {
				selection = method.call(selection);
			}

			if (selection.empty()) {
				continue;
			}

			// Although `selection instanceof d3.selection` is more explicit,
			// it fails in IE8, so we use duck typing to maintain
			// compatability.

			// d3cAssert(selection &&
			//   selection.call === d3.selection.prototype.call,
			//   'Invalid selection defined for '' + eventName +
			//   '' lifecycle event.');

			handlers = this._handlers[eventName];

			if (handlers) {
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					// Attach a reference to the parent chart so the selection's
					// `chart` method will function correctly.
					selection._chart = handlers[idx].chart || this._base._chart;
					selection.call(handlers[idx].callback);
				}
			}

			handlers = this._handlers[eventName + ':transition'];

			if (handlers && handlers.length) {
				selection = selection.transition();
				for (idx = 0, len = handlers.length; idx < len; ++idx) {
					selection._chart = handlers[idx].chart || this._base._chart;
					selection.call(handlers[idx].callback);
				}
			}
		}
	}
}
