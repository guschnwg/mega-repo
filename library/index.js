function convertValue(fromScale, toScale, value) {
  return toScale.min - ((fromScale.min - value) / fromScale.max) * toScale.max;
}
