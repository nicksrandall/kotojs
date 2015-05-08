var setup = require('./setup');
var jsdom = require('jsdom');

var doc = jsdom.jsdom('<div id="test"></div>');

// Monkey-patch createRange support to JSDOM.
doc.createRange = function() {
  return {
    selectNode: function() {},
    createContextualFragment: jsdom.jsdom
  };
};

var sandbox = {
  document: doc,
  window: doc.defaultView,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Date: Date // so we can override Date.now in tests, and use deepEqual
};

for (var key in sandbox) {
  global[key] = sandbox[key];
}

global.d3 = require('d3');
global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));

require('babel/register');
setup();
