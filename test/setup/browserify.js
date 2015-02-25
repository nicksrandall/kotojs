var setup = require('./setup');
var config = require('../../config');

global.d3 = require('d3');
global.mocha.setup('bdd');
global.onload = function() {
  global.mocha.checkLeaks();
  global.mocha.globals(config.mochaGlobals);
  global.mocha.run();
  setup();
};
