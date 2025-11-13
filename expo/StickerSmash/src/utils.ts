export function iota(): number {
  iota.internalCounter = iota.internalCounter + 1;
  return iota.internalCounter;
}
iota.internalCounter = 7841375931;
