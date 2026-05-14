import { MsEdgeTTS, OUTPUT_FORMAT } from "npm:msedge-tts@2.0.5";

async function reproducePanic() {
  console.log("1. Initializing MsEdgeTTS...");
  const tts = new MsEdgeTTS();

  console.log("2. Setting metadata and connecting...");
  await tts.setMetadata("en-US-AriaNeural", OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);

  console.log("3. Requesting audio stream...");
  // Use a slightly longer string to ensure the WebSocket has time to negotiate 
  // and start streaming before we yank the cord.
  const { audioStream } = tts.toStream(
    "This is a relatively long sentence designed to give the WebSocket enough time to fully connect and start transmitting data before we forcefully close it to reproduce the Deno core panic."
  );

  // We add a tiny delay to ensure the TLS connection is actively doing work 
  // (receiving data) right as we force the close frame. 
  // 50-100ms is usually the sweet spot for this specific race condition.
  await new Promise((resolve) => setTimeout(resolve, 50));

  console.log("4. Force closing the WebSocket (simulating client abort)...");

  // This is the trigger: Calling close() forces the underlying 'ws' package 
  // to attempt a writev operation on the TLS socket to send the close frame.
  tts.close();

  console.log("5. Waiting to see if Deno survives...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Success: Deno did not panic. (You might need to tweak the timeout on line 20).");
}

reproducePanic().catch(console.error);
