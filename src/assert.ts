/// <reference path="../typings/tsd.d.ts" />
/**
 * Simple Assertion function
 * @param  {anything} test    Anything that will evaluate to true of false.
 * @param  {string} message The error message to send if `test` is false
 */
function kotoAssert (test:boolean, message: string) {
    if (!test) {
      throw new Error(`[koto] ${message}`);
    }
}

export default kotoAssert;
