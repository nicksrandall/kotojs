function kotoAssert(test, message) {
  if (test) {
    return;
  }
  throw new Error('[koto] ' + message);
}

kotoAssert(d3, 'd3.js is required');
