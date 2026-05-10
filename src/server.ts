import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

import { Readable } from "node:stream";

const app = new Hono();
app.use('/*', serveStatic({ root: './public' }));
app.use('/*', serveStatic({ root: './src/web' }));

app.use('/helloworld.webm', async () => {
  const tts = new MsEdgeTTS();

  // select a random en-US- voice, for the demo to be more useful
  const voices = await tts.getVoices();
  const enVoices = voices.filter((voice) => /^en-us-/i.test(voice.ShortName));
  const voice = enVoices[Math.floor(Math.random() * enVoices.length)];

  await tts.setMetadata(voice.ShortName, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);
  const { audioStream } = tts.toStream("Hello World, this is a demo for the text-to-speech capabilities of Read-Out To dot me.");

  // the msedge-tts package uses node.js streams, so convert them to native web streams first
  const webStream = Readable.toWeb(audioStream);

  return new Response(webStream, {
    headers: {
      // Stream is opus encoded webm file, tell that to the browser to play it correctly
      'Content-Type': 'audio/webm; codecs=opus',
    },
  });
});

Deno.serve({
  port: 8080,
  onListen: () => console.log('App listening on http://localhost:8080/'),
}, app.fetch);
