/**
 * This class is a workaround for an issue with msedge-tts,
 * where canceled streams cause the library to access .audio of the then undefined stream,
 * causing the entire application to crash while being impossible to catch,
 * as it happens in scheduled code (WebSocket message handler) and the stacktrace contains the libraries files only
 *
 * This Response wrapper ensures that the libraries stream is never cancelled,
 * even when the receiving client cancelled/aborted their request.
 *
 * The implemented concept is called Cancellation Propagation Prevention (thanks Gemini :)
 * and prevents the msedge-tts library from ever realizing that http requests might have been cancelled
 */

export class TTSResponse extends Response {
  constructor(stream: ReadableStream, init?: ResponseInit) {
    const reader = stream.getReader();
    let isCanceled = false;
    let isReading = false;

    async function drain() {
      try {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      } catch {
        // intentionally left blank
      } finally {
        reader.releaseLock();
      }
    }

    const sanitizedStream = new ReadableStream({
      async pull(controller) {
        isReading = true;
        try {
          const { done, value } = await reader.read();
          isReading = false;

          if (isCanceled) {
            drain();
            return;
          }

          if (done) {
            reader.releaseLock();
            controller.close();
            return;
          }

          controller.enqueue(value);
        } catch (err) {
          isReading = false;
          reader.releaseLock();
          controller.error(err);
        }
      },

      cancel(_reason) {
        // ignore cancellation, instead just noop the chunks
        isCanceled = true;
        if (!isReading) drain();
      },
    });

    super(sanitizedStream, init);
  }
}
