describe('koto.chart', function() {
	beforeEach(function () {
		/* jshint ignore:start */
		koto.chart('test', function (Chart) {
		  'use strict';
		  var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };
		  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
		  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };
		  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };
		  return (function (Chart) {
		    function Donut(selection, chartOptions) {
		      _classCallCheck(this, Donut);

		      _get(Object.getPrototypeOf(Donut.prototype), 'constructor', this).call(this, selection, chartOptions);

		      // d3.chart example

		      var chart = this;

		      this.x = d3.scale.linear();

		      this.y = d3.scale.linear().domain([0, 100]);

		      this.base.attr('class', 'chart');

		      function onEnter() {
		        var length = this.data().length;
		        this.attr('x', function (d, i) {
		          return chart.x(i + 1) - 0.5;
		        }).attr('y', function (d) {
		          return chart.h - chart.y(d.value) - 0.5;
		        }).attr('width', chart.width() / length).attr('height', function (d) {
		          return chart.y(d.value);
		        }).style('fill', 'steelblue');
		      }

		      function onEnterTrans() {
		        this.duration(1000).attr('x', function (d, i) {
		          return chart.x(i) - 0.5;
		        });
		      }

		      function onTrans() {
		        this.duration(1000).attr('x', function (d, i) {
		          return chart.x(i) - 0.5;
		        });
		      }

		      function onExitTrans() {
		        this.duration(1000).attr('x', function (d, i) {
		          return chart.x(i - 1) - 0.5;
		        }).remove();
		      }

		      function dataBind(data) {
		        return this.selectAll('rect').data(data, function (d) {
		          return d.time;
		        });
		      }

		      function insert() {
		        return this.insert('rect', 'line');
		      }

		      this.layer('bars', this.base.append('g'), {
		        dataBind: dataBind,
		        insert: insert
		      });

		      this.layer('bars').on('enter', onEnter);
		      this.layer('bars').on('enter:transition', onEnterTrans);
		      this.layer('bars').on('update:transition', onTrans);
		      this.layer('bars').on('exit:transition', onExitTrans);
		      this.width(600);
		      this.height(400);
		    }

		    _inherits(Donut, Chart);

		    _prototypeProperties(Donut, null, {
		      width: {
		        value: function width(newWidth) {
		          if (!arguments.length) {
		            return this.w;
		          }
		          this.w = newWidth;
		          this.x.range([0, this.w]);
		          this.base.attr('width', this.w);
		          return this;
		        },
		        writable: true,
		        configurable: true
		      },
		      height: {
		        value: function height(newHeight) {
		          if (!arguments.length) {
		            return this.h;
		          }
		          this.h = newHeight;
		          this.y.rangeRound([0, this.h]);
		          this.base.attr('height', this.h);
		          return this;
		        },
		        writable: true,
		        configurable: true
		      },
		      transform: {
		        value: function transform(data) {
		          this.x.domain([0, data.length]);
		          return data;
		        },
		        writable: true,
		        configurable: true
		      }
		    });

		    return Donut;
		  })(Chart);
		});
		/* jshint ignore:end */
	});

	describe('constructor', function() {
		it('should name the new chart as specified', function() {
			var chart = koto.chart('test', function (Chart) {
				return Chart;
			});
			expect(chart).to.equal(koto.chart('test'));
		});

		it('should instantiate the specified chart', function() {
			var myChart = d3.select('#test').chart('test');
			expect(myChart).to.be.an.instanceof(koto.Chart);
		});

		it('should set the instance\'s `base` property as the root d3 selection', function() {
			var selection, myChart;
			selection = d3.select('#test');
			myChart = selection.chart('test');
			expect(myChart.base).to.equal(selection);
		});

	});

});
