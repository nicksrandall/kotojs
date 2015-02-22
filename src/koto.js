import kotoAssert from './assert.js';
import Chart from './chart.js';
import Layer from './layer.js';
import Options from './options.js';

kotoAssert(d3, 'd3.js is required');

class Koto {
  constructor(Options, Layer, Chart) {
    this._registry = {};

    this.Options = Options;
    this.Layer = Layer;
    this.Chart = Chart;
  }

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

var koto = new Koto(Options, Layer, Chart);


//**********************************************************************************
// d3 extensions
//**********************************************************************************
d3.selection.prototype.chart = function(chartName, options) {
  if (arguments.length === 0) {
    return this._chart;
  }
  var ChartCtor = koto.chart(chartName);
  return new ChartCtor(this, options);
};

d3.selection.enter.prototype.chart = function() {
  return this._chart;
};

d3.transition.prototype.chart = d3.selection.enter.prototype.chart;

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
