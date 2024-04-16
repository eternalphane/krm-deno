import { Sandbox } from './sandbox.ts';

type ScriptWorkerOptions<T extends Record<string, any>> = {
    context: T;
    script: string;
    permissions?: Deno.PermissionOptions;
};

export class ScriptWorker<T extends Record<string, any> = Record<string, never>> {
    #ctx;
    #script;
    #worker;

    constructor(opt: ScriptWorkerOptions<T>) {
        ({ context: this.#ctx, script: this.#script } = opt);
        const blob = new Blob([`
${Sandbox}
self.addEventListener('message', async (ev: MessageEvent) => {
    const { ctx, script } = ev.data;
    self.postMessage(await new Sandbox(ctx).eval(script));
    self.close();
});
        `], {
            type: 'application/typescript'
        });
        this.#worker = new Worker(URL.createObjectURL(blob), {
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
            });
        });
    }
}
