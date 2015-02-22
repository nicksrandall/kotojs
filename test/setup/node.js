var setup = require('./setup');
var config = require('../../config');

global.d3 = require('d3');
global[config.exportVarName] = require('../../src/' + config.entryFileName);
global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));
setup();
