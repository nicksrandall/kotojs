import kotoAssert from './assert.js';
import Chart from './chart.js';
import Layer from './layer.js';

/**
 * d3.js is a required dependancy.
 * @todo I should probably check a version number here.
 */
kotoAssert(d3, 'd3.js is required');

/**
 * Registry {@link Chart} defintions to be used later.
 * @class
 *
 * @param {Class} Options The Options class.
 * @param {Class} Layer The Layer class.
 * @param {Class} Chart The Chart class.
 */
class Koto {
  constructor(Layer, Chart) {
    this._registry = {};

    this.Layer = Layer;
    this.Chart = Chart;
  }

  /**
   * Takes a name and a function that returns a chart definiion (class).
   * It registeres that chart defintion with given name and makes it available
   * to the `d3.seletion.chart` method.
   *
   * If function is called with no parameters, the list of registered charts is
   * returned.
   *
   * If the function is only called with 'name' parameter, the chart definition
   * registered with that name is returned.
   *
   * If the function is called with 'name' and 'classFn' parameter, the chart
   * definition is registered (or overwritten) with the given name.
   *
   * @param  {string} name Name of chart to get or register.
   * @param  {function} classFn A function that returns a chart.
   * @return {Chart} The chart registered with given name (if any).
   */
  chart(name, classFn) {
    var baseChart;
    if (arguments.length === 0) {
      return this._registry;
    } else if (arguments.length === 1) {
      baseChart = this._registry[name];
      baseChart.extends = function (childName, childClassFn) {
        this._registry[childName] = childClassFn(this._registry[name]);
      };
      return baseChart;
    } else {
    	this._registry[name] = classFn(this.Chart);
      return this._registry[name];
    }
  }
}

var koto = new Koto(Layer, Chart);

/**
 * d3.js extensions
 */

/**
 * Instantiate a chart or return the chart that the current selection belongs
 * to.
 *
 * @param {String} [chartName] The name of the chart to instantiate. If the
 *        name is unspecified, this method will return the chart that the
 *        current selection belongs to.
 * @param {mixed} options The options to use when instantiated the new chart.
 *        See {@link Chart} for more information.
 */
d3.selection.prototype.chart = function(chartName) {
	// Without an argument, attempt to resolve the current selection's
	// containing d3.chart.
  if (arguments.length === 0) {
    return this._chart;
  }
  var ChartCtor = koto.chart(chartName);
  return new ChartCtor(this);
};

// Implement the zero-argument signature of `d3.selection.prototype.chart`
// for all selection types.
d3.selection.enter.prototype.chart = function() {
  return this._chart;
};
d3.transition.prototype.chart = d3.selection.enter.prototype.chart;

/**
 * Create a new layer on the d3 selection from which it is called.
 *
 * @static
 *
 * @param {Object} [options] Options to be forwarded to {@link Layer|the Layer
 *        constructor}
 * @returns {d3.selection}
 */
d3.selection.prototype.layer = function(options) {
	var layer = new Layer(this);
	var eventName;

	// Set layer methods (required)
	layer.dataBind = options.dataBind;
	layer.insert = options.insert;

	// Bind events (optional)
	if ('events' in options) {
		for (eventName in options.events) {
			layer.on(eventName, options.events[eventName]);
		}
	}

	// Mix the public methods into the D3.js selection (bound appropriately)
	this.on = function() { return layer.on.apply(layer, arguments); };
	this.off = function() { return layer.off.apply(layer, arguments); };
	this.draw = function() { return layer.draw.apply(layer, arguments); };

	return this;
};

export default koto;
