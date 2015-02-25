import koto from '../../src/koto';

koto.chart('Test', function (Chart){
  // make sure to change the name!
  class Test extends Chart {
    constructor(selection) {
      super(selection);

      // Setup Default Options
      this.config('width', 500);
      this.config('height', 500);

      this.accessor('value', function (line) { return line[2]; });

      // Initialize Chart Helpers (Scales, Layouts, Ect)
      this.xScale = d3.scale.linear();

      // Setup Layers
      this.layer('bars', this.base.append('g'), {
        dataBind: function dataBind (data) {
          return this.selectAll('.selection').data(data);
        },
        insert: function insert() {
          return this;
        }
      })
      .on('enter', function onEnter() {
        return this;
      })
      .on('update:transition', function onTrans() {
        return this;
      })
      .on('exit', function onExitTrans() {
        return this;
      });

    }

    // add/override chart methods
    preDraw(data) {
      this.xScale
        .domain(
          d3.extent(data, function (item) {
            return this.accessor('value')(item);
          }.bind(this))
        )
        .range([0, this.config('width')]);
    }
  }

  return Test;
});
