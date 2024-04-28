import { encodeBase64 } from '@std/encoding/base64';

import { Sandbox } from './sandbox.ts';

type ScriptWorkerOptions<T extends Record<string, any>> = {
    context: T;
    script: string;
    permissions?: Deno.PermissionOptions;
    globals?: string[];
};

export class ScriptWorker<T extends Record<string, any> = Record<string, never>> {
    #ctx;
    #script;
    #worker;
    #globals;

    constructor(opt: ScriptWorkerOptions<T>) {
        ({ context: this.#ctx, script: this.#script, globals: this.#globals } = opt);
        const workerScript = `
${Sandbox}
self.addEventListener('message', async (ev) => {
    const { ctx, script, globals } = ev.data;
    for (const global of globals) {
        if (global !== '$') {
            Object.defineProperty(ctx, global, Object.getOwnPropertyDescriptor(globalThis, global));
        }
    }
    self.postMessage(await new Sandbox(ctx).eval(script));
    self.close();
});
        `.trim();
        this.#worker = new Worker(`data:application/javascript;base64,${encodeBase64(workerScript)}`, {
            type: 'module',
            deno: {
                permissions: opt.permissions ?? 'none',
            },
        });
    }

    run() {
        return new Promise<any>((resolve) => {
            this.#worker.addEventListener('message', (ev) => {
                resolve(ev.data);
            });
            this.#worker.postMessage({
                ctx: { $: this.#ctx },
                script: this.#script,
                globals,
            });
        });
    }
}
