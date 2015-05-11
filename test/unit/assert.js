import kotoAssert from '../../src/assert';

describe('kotoAssert', function() {
  it('should do nothing when test is truthy', function () {
    expect(function () {
      kotoAssert(true, 'do nothing');
    }).not.to.throw(Error);
  });

  it('should throw error when test is falsy', function () {
    expect(function () {
      kotoAssert(false, 'This should throw an error!');
    }).to.throw(Error);
  });
});
