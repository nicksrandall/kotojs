import koto from '../../src/koto';
import kotoAssert from '../../src/assert';

describe('kotojs', function() {
  it('should exist', function() {
    expect(koto).to.exist;
  });

  describe('constructor', function() {
    it('should name the new chart as specified', function() {

      var chart = koto.chart('test', function (Chart) {
        return Chart;
      });
      expect(chart).to.equal(koto.chart('test'));
    });

    it('should return registry if called with no arguments', function () {
      expect(koto.chart()).to.have.any.keys('test');
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
});

describe('kotoAssert', function () {
  var good = function () {
    kotoAssert(true, 'test');
  };
  var bad = function () {
    kotoAssert(false, 'test');
  };

  it('should do nothing on truthy value', function () {
    expect(good).to.not.throw(Error);
  });

  it('should throw an error on falsey value', function () {
    expect(bad).to.throw(Error);
  });
});
