var setup = require('./setup');
var config = require('../../config');

global.d3 = require('../../bower_components/d3/d3');
global[config.exportVarName] = require('../../tmp/__entry');
global.mocha.setup('bdd');
global.onload = function() {
  global.mocha.checkLeaks();
  global.mocha.globals(config.mochaGlobals);
  global.mocha.run();
  setup();
};
