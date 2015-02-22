"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Chart = _interopRequire(require("./chart.js"));

var Layer = _interopRequire(require("./layer.js"));

var Options = _interopRequire(require("./options.js"));

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

module.exports = koto;