import d3 from 'd3';
import kotoAssert from './assert';
import Chart from './chart';

kotoAssert(d3, 'd3 js is required.');

var koto = {};
koto.Base = Chart;

export default koto;
