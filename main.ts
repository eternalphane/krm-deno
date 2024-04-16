import { toText } from '@std/streams';
import * as YAML from '@std/yaml';

import { process } from './src/process.ts';

const input = YAML.parse(await toText(Deno.stdin.readable.pipeThrough(new TextDecoderStream())));
const output = await process(input);
new ReadableStream({
    start: (controller) => {
        controller.enqueue(YAML.stringify(output));
        controller.close();
    },
}).pipeThrough(new TextEncoderStream()).pipeTo(Deno.stdout.writable);
