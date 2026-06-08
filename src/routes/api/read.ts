import { Readable } from 'node:stream';
import { Hono } from 'hono';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import xmlEscape from 'xml-escape';
import { isVoiceValid } from "../../utils/isVoiceValid.ts";

const readRoute = new Hono();

readRoute.get('/read', async (c) => {
  const tts = new MsEdgeTTS();

  const { text, voice } = c.req.query();
  if (!text || !text.trim()) {
    return c.json({ error: 'text query parameter is required' }, 400);
  }
  if (!voice || !voice.trim()) {
    return c.json({ error: 'voice query parameter is required' }, 400);
  }

  const validVoice = await isVoiceValid(voice);
  const escapedText = xmlEscape(text).trim();

  if (!validVoice) {
    return c.json({ error: `invalid voice specified: ${voice}` }, 400);
  }

  await tts.setMetadata(voice, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);
  const { audioStream } = tts.toStream(escapedText);

  // the msedge-tts package uses node.js streams, so convert them to native web streams first
  const webStream = Readable.toWeb(audioStream);

  return new Response(webStream, {
    headers: {
      // Stream is opus encoded webm file, tell that to the browser to play it correctly
      'Content-Type': 'audio/webm; codecs=opus',
    },
  });
});

export { readRoute };
