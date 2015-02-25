import kotoAssert from './assert.js';

/**
 * Create a koto chart
 *
 * @constructor
 *
 * @param {d3.selection} selection The chart's "base" DOM node. This should
 *        contain any nodes that the chart generates.
 */
class Chart {
  constructor(selection) {
    this.base = selection; // Container for chart @type {d3.selection}.
      this.hasDrawn = false; // Has this chart been drawn at lease once?

      // private
      this._layers = {};
      this._attached = {};
      this._events = {};
      this._configs = {};
      this._accessors = {};
  }

  /**
   * A "hook" method that you may define to modify input data before it is used
   * to draw the chart's layers and attachments. This method will be used by all
   * sub-classes.
   *
   * Note: you will most likely never call this method directly, but rather
   * include it as part of a chart definition, and then rely on d3.chart to
   * invoke it when you draw the chart with {@link Chart#draw}.
   *
   * @param {Array} data Input data provided to @link Chart#draw}.
   * @returns {mixed} Data to be used in drawing the chart's layers and
   *                  attachments.
   */
  transform(data) { return data; }

  /**
   * A "hook" method that you may define to choose which mutation of the input
   * data is sent to which of the attached charts (by name). This method will
   * be used by all sub-classes. This only applies to charts that use the
   * {@link Chart#attach} method.
   *
   * Note: you will most likely never call this method directly, but rather
   * include it as part of a chart definition, and then rely on d3.chart to
   * invoke it when you draw the chart with {@link Chart#draw}.
   *
   * @param {String} data Name of attached chart defined in {@link Chart#attach}.
   * @param {Array} data Input data provided to {@link Chart#draw}.
   * @returns {mixed} Data to be used in drawing the chart's layers and
   *                  attachments.
   */
  demux(name, data) { return data; }

  /**
   * A "hook" method that will allow you to run some arbitrary code before
   * {@link Chart#draw}. This will run everytime {@link Chart#draw} is called.
   *
   * Note: you will most likely never call this method directly, but rather
   * include it as part of a chart definition, and then rely on d3.chart to
   * invoke it when you draw the chart with {@link Chart#draw}.
   *
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  preDraw() {}

  /**
   * A "hook" method that will allow you to run some arbitrary code after
   * {@link Chart#draw}. This will run everytime {@link Chart#draw} is called.
   *
   * Note: you will most likely never call this method directly, but rather
   * include it as part of a chart definition, and then rely on d3.chart to
   * invoke it when you draw the chart with {@link Chart#draw}.
   *
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  postDraw() {}

  /**
   * Remove a layer from the chart.
   *
   * @param {String} name The name of the layer to remove.
   * @returns {Layer} The layer removed by this operation.
   */
  unlayer(name) {
    var layer = this.layer(name);

    delete this._layers[name];
    delete layer._chart;

    return layer;
  }

  /**
   * Interact with the chart's {@link Layer|layers}.
   *
   * If only a `name` is provided, simply return the layer registered to that
   * name (if any).
   *
   * If a `name` and `selection` are provided, treat the `selection` as a
   * previously-created layer and attach it to the chart with the specified
   * `name`.
   *
   * If all three arguments are specified, initialize a new {@link Layer} using
   * the specified `selection` as a base passing along the specified `options`.
   *
   * The {@link Layer.draw} method of attached layers will be invoked
   * whenever this chart's {@link Chart#draw} is invoked and will receive the
   * data (optionally modified by the chart's {@link Chart#transform} method.
   *
   * @param {String} name Name of the layer to attach or retrieve.
   * @param {d3.selection|Layer} [selection] The layer's base or a
   *        previously-created {@link Layer}.
   * @param {Object} [options] Options to be forwarded to {@link Layer|the Layer
   *        constructor}
   *
   * @returns {Layer}
   */
  layer(name, selection, options) {
    var _layer;

    if (arguments.length === 1) {
      return this._layers[name];
    }

    // we are reattaching a previous layer, which the
    // selection argument is now set to.
    if (arguments.length === 2) {

      if (typeof selection.draw === 'function') {
        selection._chart = this;
        this._layers[name] = selection;
        return this._layers[name];

      } else {
        kotoAssert(false, 'When reattaching a layer, the second argument '+
          'must be a d3.chart layer');
      }
    }

    _layer = selection.layer(options);

    this._layers[name] = _layer;

    selection._chart = this;

    return _layer;
  }

  /**
   * Register or retrieve an "attachment" Chart. The "attachment" chart's `draw`
   * method will be invoked whenever the containing chart's `draw` method is
   * invoked.
   *
   * @param {String} attachmentName Name of the attachment
   * @param {Chart} [chart] koto to register as a mix in of this chart. When
   *        unspecified, this method will return the attachment previously
   *        registered with the specified `attachmentName` (if any).
   *
   * @returns {Chart} Reference to this chart (chainable).
   */
  attach(attachmentName, chart) {
    if (arguments.length === 1) {
      return this._attached[attachmentName];
    }

    this._attached[attachmentName] = chart;
    return chart;
  }

  /**
   * Update the chart's representation in the DOM, drawing all of its layers and
   * any "attachment" charts (as attached via {@link Chart#attach}).
   *
   * Note: The first time you call this method, the property `hasDrawn` will be
   * set to true. This is helpful if you want to only run some code on the first
   * time the chart is drawn.
   *
   * @param {Object} data Data to pass to the {@link Layer#draw|draw method} of
   *        this cart's {@link Layer|layers} (if any) and the {@link
   *        Chart#draw|draw method} of this chart's attachments (if any).
   */
  draw(rawData) {

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
  }

  /**
   * Function invoked with the context specified when the handler was bound (via
   * {@link Chart#on} {@link Chart#once}).
   *
   * @callback ChartEventHandler
   * @param {...*} arguments Invoked with the arguments passed to {@link
   *         Chart#trigger}
   */

  /**
   * Subscribe a callback function to an event triggered on the chart. See {@link
   * Chart#once} to subscribe a callback function to an event for one occurence.
   *
   * @externalExample {runnable} chart-on
   *
   * @param {String} name Name of the event
   * @param {ChartEventHandler} callback Function to be invoked when the event
   *        occurs
   * @param {Object} [context] Value to set as `this` when invoking the
   *        `callback`. Defaults to the chart instance.
   *
   * @returns {Chart} A reference to this chart (chainable).
   */
  on(name, callback, context) {
    var events = this._events[name] || (this._events[name] = []);
    events.push({
      callback: callback,
      context: context || this,
      _chart: this
    });
    return this;
  }

  /**
   * Subscribe a callback function to an event triggered on the chart. This
   * function will be invoked at the next occurance of the event and immediately
   * unsubscribed. See {@link Chart#on} to subscribe a callback function to an
   * event indefinitely.
   *
   * @externalExample {runnable} chart-once
   *
   * @param {String} name Name of the event
   * @param {ChartEventHandler} callback Function to be invoked when the event
   *        occurs
   * @param {Object} [context] Value to set as `this` when invoking the
   *        `callback`. Defaults to the chart instance
   *
   * @returns {Chart} A reference to this chart (chainable)
   */
  once(name, callback, context) {
    var self = this;
    var _once = function() {
      self.off(name, _once);
      callback.apply(this, arguments);
    };
    return this.on(name, _once, context);
  }

  /**
   * Unsubscribe one or more callback functions from an event triggered on the
   * chart. When no arguments are specified, *all* handlers will be unsubscribed.
   * When only a `name` is specified, all handlers subscribed to that event will
   * be unsubscribed. When a `name` and `callback` are specified, only that
   * function will be unsubscribed from that event. When a `name` and `context`
   * are specified (but `callback` is omitted), all events bound to the given
   * event with the given context will be unsubscribed.
   *
   * @externalExample {runnable} chart-off
   *
   * @param {String} [name] Name of the event to be unsubscribed
   * @param {ChartEventHandler} [callback] Function to be unsubscribed
   * @param {Object} [context] Contexts to be unsubscribe
   *
   * @returns {Chart} A reference to this chart (chainable).
   */
  off(name, callback, context) {
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
        if ((callback && callback === event.callback) ||
            (context && context === event.context)) {
          events.splice(j, 1);
        }
      }
    }

    return this;
  }

  /**
   * Publish an event on this chart with the given `name`.
   *
   * @externalExample {runnable} chart-trigger
   *
   * @param {String} name Name of the event to publish
   * @param {...*} arguments Values with which to invoke the registered
   *        callbacks.
   *
   * @returns {Chart} A reference to this chart (chainable).
   */
  trigger(name) {
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
  }
  /**
   * Get and set chart options (or configs)
   *
   * @param  {mixed} nameOrObject name of item getting or setting
   *                              or its an object with key value pairs.
   * @param  {mixed} value the value for config item witha that name.
   * @return {mixed} if getting, its the value. if setting it is the chart instance.
   */
  config(nameOrObject, value) {
    var key;
    if (arguments.length === 0) {
      return this._configs;
    }

    if (arguments.length === 1) {
      if (typeof nameOrObject === 'object') {
        for (key in nameOrObject) {
          this._configs[key] = nameOrObject[key];
        }
        return this;
      }
      kotoAssert(this._configs[nameOrObject], `${nameOrObject} is not a valid option.`);
      return this._configs[nameOrObject];
    }

    if(arguments.length === 2) {
      this._configs[nameOrObject] = value;
      return this;
    }
  }

  /**
   * This will get or set any of the chart's accessors.
   *
   * @param  {String or Object} item If string, it will return the function for that accessor item.
   *                                 If object, it will update that accessor with set function.
   * @param  {function} [value] The function to update accessor item with.
   * @return {object} The chart to preserve chainability.
   */
  accessor (item, value) {
    var key;
    if (arguments.length === 0) {
      return this._accessors;
    }

    if (arguments.length === 1) {
      if (typeof item === 'string') {
        kotoAssert(this._accessors[item], `${item} is not a valid accessor.`);
        if (typeof this._accessors[item] === 'object') {
          return this._accessors[item].accessor;
        }
        return this._accessors[item];
      } else {
        for (key in item) {
          this._accessors[key] = item[key];
        }
      }
    } else {
      this._accessors[item] = value;
    }
    return this;
  }
}

export default Chart;
