import Chart from './chart.js';
import Layer from './layer.js';
import Options from './options.js';

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

export default koto;
