# koto

A framework for creating reusable charts with [D3.js](http://d3js.org), written in ES6.

[![Travis build status](http://img.shields.io/travis/nicksrandall/kotojs.svg?style=flat)](https://travis-ci.org/nicksrandall/kotojs)
[![Code Climate](https://codeclimate.com/github/nicksrandall/kotojs/badges/gpa.svg)](https://codeclimate.com/github/nicksrandall/kotojs)
[![Test Coverage](https://codeclimate.com/github/nicksrandall/kotojs/badges/coverage.svg)](https://codeclimate.com/github/nicksrandall/kotojs)
[![Dependency Status](https://david-dm.org/nicksrandall/kotojs.svg)](https://david-dm.org/nicksrandall/kotojs)
[![devDependency Status](https://david-dm.org/nicksrandall/kotojs/dev-status.svg)](https://david-dm.org/nicksrandall/kotojs#info=devDependencies)
[![Join the chat at https://gitter.im/nicksrandall/kotojs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nicksrandall/kotojs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Getting Started
`koto.js` has been written in [ES6](https://babeljs.io/docs/learn-es6/) and then transpired to ES5 with [babel](https://babeljs.io/). It uses the UMD syntax so that it can be integrated with many module/bundle loaders.

### Install
You can install koto via [bower](http://bower.io) by running:
```bash
$ bower install koto --save
```
or via [npm](http://www.npmjs.com) by running:
```bash
$ npm install koto --save
```

## Documentation
Browse the [Wiki](https://github.com/nicksrandall/kotojs/wiki/API-Documentation).

## Build Instructions
Build requirements:

- [iojs](https://iojs.org/en/index.html)
- [gulp](http://gulpjs.com/)


```js
$ npm install
$ gulp build
```

## Acknowledgements
This project is **HEAVILY** inspired by the awesome work done by @jugglinmike and @iros and their charting framework called [d3.chart](https://github.com/misoproject/d3.chart).