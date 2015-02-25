import koto from '../../src/koto';

describe('integration', function() {

  beforeEach(function() {
    koto.chart('test', function (Chart) {
      return Chart;
    });
    this.myChart = d3.select('#test').chart('test');
  });

  it('should Layer#chart returns a reference to the parent chart', function() {
    var layer = this.myChart.layer('layer1', this.myChart.base.append('g'), {});

    expect(layer.chart()).to.equal(this.myChart);
  });

  describe('Chart#draw', function() {
    beforeEach(function() {
      // Create spies
      this.events = {
        'enter': sinon.spy(),
        'enter:transition': sinon.spy(),
        'update': sinon.spy(),
        'update:transition': sinon.spy(),
        'exit': sinon.spy(),
        'exit:transition': sinon.spy()
      };
      this.dataBind = sinon.spy(function(data) {
        return this.selectAll('g')
          .data(data, function(d) { return d; });
      });
      this.insert = sinon.spy(function() {
        return this.append('g');
      });

      this.layer = this.myChart.layer('layer1', this.myChart.base.append('g'), {
        dataBind: this.dataBind,
        insert: this.insert,
        events: this.events
      });
      sinon.spy(this.layer, 'draw');

      this.myChart.draw([1, 2]);
      this.myChart.draw([2, 3]);
    });

    it('should `dataBind` selection\'s `.chart` method returns a reference to the parent chart', function() {
      expect(this.dataBind.thisValues[0].chart()).to.equal(this.myChart);
    });

    it('should `insert` selection\'s `.chart` method returns a reference to the parent chart', function() {
      expect(this.insert.thisValues[0].chart()).to.equal(this.myChart);
    });

    describe('Lifecycle selections\' `.chart` method returns a reference to the parent chart', function() {
      it('should `enter`', function() {
        expect(this.events.enter.thisValues[0].chart()).to.equal(this.myChart);
      });
      it('should `enter:transition`', function() {
        expect(this.events['enter:transition'].thisValues[0].chart()).to.equal(this.myChart);
      });
      it('should `update`', function() {
        expect(this.events.update.thisValues[0].chart()).to.equal(this.myChart);
      });
      it('should `update:transition`', function() {
        expect(this.events['update:transition'].thisValues[0].chart()).to.equal(this.myChart);
      });
      it('should `exit`', function() {
        expect(this.events.exit.thisValues[0].chart()).to.equal(this.myChart);
      });
      it('should `exit:transition`', function() {
        expect(this.events['exit:transition'].thisValues[0].chart()).to.equal(this.myChart);
      });
    });

    describe('Layer attaching and detaching', function() {

      beforeEach(function() {
        this.myChart.layer('testLayer', this.myChart.base.append('g'), {});
        this.layer = this.myChart.unlayer('testLayer');
      });

      describe('Disjoins child from parent', function() {
        it('should `unlayer` detaches layer from chart', function() {
          expect(typeof this.myChart.layer('testLayer')).to.equal('undefined');
        });

        it('should detached layer does not have reference to parent chart', function() {
          expect(typeof this.layer.chart()).to.equal('undefined');
        });
      });

      describe('Reattaches child to parent', function() {
        beforeEach(function() {
          this.reattachedLayer = this.myChart.layer('anotherLayer', this.layer);
        });

        it('should `layer` reattaches a detached layer to a chart', function() {
          expect(this.reattachedLayer).to.equal(this.myChart.layer('anotherLayer'));
        });

        it('should reattached layer has a reference to parent chart', function() {
          expect(this.reattachedLayer.chart()).to.equal(this.myChart);
        });

        it('should attempting to reattach anything other than a layer fails', function() {
          expect(function() {
              this.myChart.layer('notalayer', {});
            },
            '[koto.chart] When reattaching a layer, the second argument must be a koto.chart layer'
          ).to.throw(Error);

          expect(typeof this.myChart.layer('notalayer')).to.equal('undefined');
        });
      });
    });
  });
});
