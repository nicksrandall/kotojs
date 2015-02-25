import koto from '../../src/koto';

require('../charts/single.js');

describe('koto.chart', function() {

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

	describe('extend', function () {
		it('should name the new chart as specified', function (){
			var ExChart = koto.chart('test2', function () {
				class Test2 extends koto.chart('test') {
					constructor(selection) {
						super(selection);
					}
				}

				return Test2;
			});

			expect(ExChart).to.equal(koto.chart('test2'));
		});
	});

});
