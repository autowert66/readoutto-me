import { Readable } from 'node:stream';
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import xmlEscape from 'xml-escape';

import { isVoiceValid } from '../../utils/isVoiceValid.ts';
import { ErrorResponse } from '../../utils/ErrorResponse.ts';
import { TTSResponse } from '../../utils/TTSResponse.ts';

const schema = z.object({
  text: z.string().min(1),
  voice: z.string().min(1),
});

async function handleReadRequest(voice: string, text: string) {
  const validVoice = await isVoiceValid(voice);
  const escapedText = xmlEscape(text).trim();

  if (!validVoice) {
    return new ErrorResponse(`invalid voice specified: ${voice}`);
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);
  const { audioStream } = tts.toStream(escapedText);

  // the msedge-tts package uses node.js streams, so convert them to native web streams first
  const webStream = Readable.toWeb(audioStream) as unknown as ReadableStream;

  return new TTSResponse(webStream, {
    headers: {
      // Stream is opus encoded webm file, tell that to the browser to play it correctly
      'Content-Type': 'audio/webm; codecs=opus',
    },
  });
}

const readRoute = new Hono()
  .get(
    '/read',
    zValidator('query', schema),
    (c) => {
      const { text, voice } = c.req.valid('query');
      return handleReadRequest(voice, text);
    },
  )
  .post(
    '/read',
    zValidator('json', schema),
    (c) => {
      const { text, voice } = c.req.valid('json');
      return handleReadRequest(voice, text);
    },
  );

export { readRoute };
