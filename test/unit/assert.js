import kotoAssert from '../../src/assert.js';

describe('kotoAssert', function() {
  it('should do nothing when test is truthy', function () {
    expect(kotoAssert(true, 'do nothing')).not.to.throw(Error);
  });

  it('should throw error when test is falsy', function () {
    expect(kotoAssert(false, 'This should throw an error!')).to.throw(Error);
  });
});
