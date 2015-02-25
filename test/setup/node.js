var setup = require('./setup');
var jsdom = require('jsdom');

// Setup a virtual dom to test dom manipulation.
global.document = jsdom.jsdom();
// Monkey-patch createRange support to JSDOM.
global.document.createRange = function() {
  return {
    selectNode: function() {},
    createContextualFragment: jsdom.jsdom
  };
};
global.window = global.document.parentWindow;

global.d3 = require('d3');
global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));

setup();
