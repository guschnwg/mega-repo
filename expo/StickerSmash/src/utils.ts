export function iota(): number {
  iota.internalCounter = iota.internalCounter + 1;
  return iota.internalCounter;
}
iota.internalCounter = Date.now();
