import * as d3 from 'd3';
import kotoAssert from './assert.js';
import koto from './integration';

/**
 * d3.js is a required dependancy.
 * @todo I should probably check a version number here.
 */
kotoAssert(d3, 'd3.js is required');

export default koto;
