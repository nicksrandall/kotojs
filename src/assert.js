export default function kotoAssert(test, message) {
  if (test) {
    return;
  }
  throw new Error('[koto] ' + message);
}
