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
			var ExChart = koto.chart('test').extend('test2', function (Test) {
				class Test2 extends Test {
					constructor(selection) {
						super(selection);
					}
				}
				return Test2;
			});
			expect(ExChart).to.equal(koto.chart('test2'));
		});

    it('should create a new chart that inhertits from base chart', function () {
      koto.chart('test').extend('test2', function (Test) {
        class Test2 extends Test {
          constructor(selection) {
            super(selection);
          }
          method(value) {
            this.test = value;
          }
        }
        return Test2;
      });

      var extended = d3.select('#test2').chart('test2');

      expect(extended).to.be.an.instanceof(koto.chart('test'));
    });
	});

  describe('Attachments', function () {
    before(function () {
      this.myChart = d3.select('#test').chart('test');
      this.attachmentChart = d3.select('body').chart('test');
      sinon.spy(this.attachmentChart, 'draw');
    });

    describe('#attach', function () {
      it('should return the requested attachment', function () {
        var myAttachment = this.myChart.attach('myAttachment', this.attachmentChart);

        expect(this.myChart.attach('myAttachment')).to.equal(this.attachmentChart);
        expect(myAttachment).to.equal(this.attachmentChart);
      });

      it('should connect the specified chart', function () {
        var data = [13, 31];
        this.myChart.attach('myAttachment', this.attachmentChart);
        this.myChart.draw(data);

        expect(this.attachmentChart.draw.callCount).to.equal(1);
        expect(this.attachmentChart.draw.args[0].length).to.equal(1);
        expect(this.attachmentChart.draw.args[0][0]).to.deep.equal(data);
      });
    });

    describe('#demux', function () {
      var data = {
        series1: [1, 2, 3],
        series2: [4, 5, 6]
      };

      before(function () {
        this.attachmentChart2 = d3.select('body').chart('test');
        sinon.spy(this.attachmentChart2, 'draw');
        this.myChart.attach('attachment1', this.attachmentChart);
        this.myChart.attach('attachment2', this.attachmentChart2);
      });

      it('should use provided function to demultiplex the data', function () {
        this.myChart.demux = function(attachmentName, data) {
          if (attachmentName === 'attachment1') {
            return data.series1;
          }
          return data;
        };
        this.myChart.draw(data);

        expect(
          this.attachmentChart.draw.lastCall.args,
          'Demuxes data passed to charts with registered function'
        )
        .to.deep.equal([[1, 2, 3]]);
        expect(
          this.attachmentChart2.draw.args[0][0].series1,
          data.series1,
          'Unmodified data passes through to attachments directly'
        )
        .to.deep.equal(data.series1);
        expect(
          this.attachmentChart2.draw.args[0][0].series2,
          data.series1,
          'Unmodified data passes through to attachments directly'
        )
        .to.deep.equal(data.series2);
      });
    });
  });

  describe('#draw', function () {
    before(function () {
      var layer1, layer2, transform, transformedData, myChart;
      this.transformedData = transformedData = {};
      this.transform = transform = sinon.stub().returns(transformedData);
      this.myChart = myChart = d3.select('#test').chart('test');
      myChart.transform = transform;

      this.layer1 = layer1 = myChart.layer('layer1', myChart.base.append('g'), {
        dataBind: function(data) { return this.data(data); },
        insert: function() { return this.append('g'); }
      });
      sinon.spy(layer1, 'draw');
      this.layer2 = layer2 = myChart.layer('layer2', myChart.base.append('g'), {
        dataBind: function(data) { return this.data(data); },
        insert: function() { return this.append('g'); }
      });
      sinon.spy(layer2, 'draw');

      this.attachment1 = d3.select('#test').chart('test');
      this.attachment2 = d3.select('#test').chart('test');
      myChart.attach('test1', this.attachment1);
      myChart.attach('test2', this.attachment2);
      sinon.stub(this.attachment1, 'draw');
      sinon.stub(this.attachment2, 'draw');
    });

    it('should invoke the transform method once with the specified data', function () {
      var data = [1, 2, 3];
      expect(this.transform.callCount).to.equal(0);

      this.myChart.draw(data);

      expect(this.transform.callCount).to.equal(1);
      expect(this.transform.args[0][0]).to.equal(data);
    });

    it('should cascade the transform using super.', function () {
      var grandpaTransform = sinon.spy(function(d) { return d * 2; });
      var paTransform = sinon.spy(function(d) { return d * 3; });

      koto.chart('TestTransformGrandpa', function (Chart) {
        return class grandpa extends Chart {
          constructor(selection) {
            super(selection);
          }
          transform(data) {
            var datum = super.transform(data);
            return grandpaTransform(datum);
          }
        };
      });

      koto.chart('TestTransformGrandpa').extend('TestTransformPa', function (Chart) {
        return class pa extends Chart {
          constructor(selection) {
            super(selection);
          }
          transform(data) {
            var datum = super.transform(data);
            return paTransform(datum);
          }
        };
      });

      var chart = d3.select('#test').chart('TestTransformPa');

      chart.draw(7);

      expect(paTransform.calledWith(14)).to.be.true;
      expect(grandpaTransform.calledWith(7)).to.be.true;
    });

  });

});
