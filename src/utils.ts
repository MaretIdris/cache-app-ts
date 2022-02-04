export function getCurrentTimeInSec() {
  return new Date().getTime() / 1000;
}

export function createTimestamp() {
  const timestampInMillisec = new Date().getTime();
  return timestampInMillisec / 1000;
}
