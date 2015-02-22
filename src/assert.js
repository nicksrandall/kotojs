/**
 * Simple Assertion function
 * @param  {anything} test    Anything that will evaluate to true of false.
 * @param  {string} message The error message to send if `test` is false
 */
export default function kotoAssert(test, message) {
  if (test) {
    return;
  }
  throw new Error('[koto] ' + message);
}
