var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.koto = factory();
})(this, function () {
  "use strict";

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

  var lifecycleRe = /^(enter|update|merge|exit)(:transition)?$/;

  var Layer = (function () {
    function Layer(base) {
      _classCallCheck(this, Layer);

      this._base = base;
      this._handlers = {};
    }

    _prototypeProperties(Layer, null, {
      dataBind: {
        value: function dataBind() {
          kotoAssert(false, "Layers must specify a dataBind method.");
        },
        writable: true,
        configurable: true
      },
      insert: {
        value: function insert() {
          kotoAssert(false, "Layers must specify an `insert` method.");
        },
        writable: true,
        configurable: true
      },
      on: {
        value: function on(eventName, handler, options) {
          options = options || {};

          kotoAssert(lifecycleRe.test(eventName), "Unrecognized lifecycle event name specified to `Layer#on`: '${eventName}'.");

          if (!(eventName in this._handlers)) {
            this._handlers[eventName] = [];
          }
          this._handlers[eventName].push({
            callback: handler,
            chart: options.chart || null
          });
          return this._base;
        },
        writable: true,
        configurable: true
      },
      off: {
        value: function off(eventName, handler) {
          var handlers = this._handlers[eventName];
          var idx;

          kotoAssert(lifecycleRe.test(eventName), "Unrecognized lifecycle event name specified to `Layer#on`: '${eventName}'.");

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
        },
        writable: true,
        configurable: true
      },
      draw: {
        value: function draw(data) {
          var bound, entering, events, selection, method, handlers, eventName, idx, len;

          bound = this.dataBind.call(this._base, data);

          // Although `bound instanceof d3.selection` is more explicit, it fails
          // in IE8, so we use duck typing to maintain compatability.

          // d3cAssert(bound && bound.call === d3.selection.prototype.call,
          //   'Invalid selection defined by `Layer#dataBind` method.');
          // d3cAssert(bound.enter, 'Layer selection not properly bound.');

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

            handlers = this._handlers[eventName + ":transition"];

            if (handlers && handlers.length) {
              selection = selection.transition();
              for (idx = 0, len = handlers.length; idx < len; ++idx) {
                selection._chart = handlers[idx].chart || this._base._chart;
                selection.call(handlers[idx].callback);
              }
            }
          }
        },
        writable: true,
        configurable: true
      }
    });

    return Layer;
  })();

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

  var Koto = (function () {
    function Koto(Options, Layer, Chart) {
      _classCallCheck(this, Koto);

      this._registry = {};

      this.Options = Options;
      this.Layer = Layer;
      this.Chart = Chart;
    }

    _prototypeProperties(Koto, null, {
      chart: {
        value: function chart(name, classFn) {
          var baseChart;
          if (arguments.length === 0) {
            return this._registry;
          } else if (arguments.length === 1) {
            baseChart = this._registry[name];
            baseChart["extends"] = function (childName, childClassFn) {
              this._registry[childName] = childClassFn(this._registry[name]);
            };
            return baseChart;
          } else {
            this._registry[name] = classFn(this.Chart);
            return this._registry[name];
          }
        },
        writable: true,
        configurable: true
      }
    });

    return Koto;
  })();

  var koto = new Koto(Options, Layer, Chart);


  //**********************************************************************************
  // d3 extensions
  //**********************************************************************************
  d3.selection.prototype.chart = function (chartName, options) {
    if (arguments.length === 0) {
      return this._chart;
    }
    var ChartCtor = koto.chart(chartName);
    return new ChartCtor(this, options);
  };

  d3.selection.enter.prototype.chart = function () {
    return this._chart;
  };

  d3.transition.prototype.chart = d3.selection.enter.prototype.chart;

  return koto;
});
//# sourceMappingURL=./koto.js.map