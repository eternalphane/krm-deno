export class Sandbox<T extends Record<string, any> = Record<string, never>> {
    #ctx;

    constructor(context: T, traps: ProxyHandler<T> = {}) {
        traps.has ??= (_target, _prop) => true;
        const get = traps.get ?? ((target, prop, _receiver) => target[prop as any]);
        this.#ctx = new Proxy(context, {
            ...traps,
            get: (target, prop, receiver) => prop === Symbol.unscopables ? undefined : get(target, prop, receiver),
        });
    }

    eval(script: string): Promise<any> {
        return new Function(
            'ctx',
            `
Reflect.defineProperty(Function.prototype, 'constructor', {
    value: undefined,
    configurable: false,
    writable: false,
    enumerable: false,
});
with (ctx) {
    'use strict';
    return (async () => {
        'use strict';
        ${script}
    })();
}`,
        ).call(this.#ctx, this.#ctx);
    }
}
