// turn a web stream into a async generator function so it can be used with for-await of
// needed because safari does not implement Symbol.asyncIterable for Response.prototype.body yet, see https://caniuse.com/wf-async-iterable-streams
export async function* makeAsyncIterable(
  stream: ReadableStream,
): AsyncGenerator<unknown, void, void> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
