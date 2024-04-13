import { deepMerge } from '@std/collections/deep-merge';
import * as YAML from '@std/yaml';

import type { TSchema } from '@sinclair/typebox';
import type { TypeCheck, ValueErrorIterator } from '@sinclair/typebox/compiler';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';

import { Sandbox } from './sandbox.ts';
import { API_VERSION, KIND, ResourceList } from './schema/resource_list.ts';
import { Result } from './schema/result.ts';

class ValidationError extends Error {
    cause: Result[];

    constructor(errors: ValueErrorIterator) {
        super('ResourceList validation error');
        this.cause = [...errors].filter(({ path }) => path).map(({ message, path, value, schema }) =>
            deepMerge<Result>(Value.Create(Result), {
                message: message,
                resourceRef: {
                    apiVersion: API_VERSION,
                    kind: KIND,
                    name: '',
                },
                field: {
                    path: path.slice(1).split('/').join('.'),
                    currentValue: value ?? null,
                    proposedValue: Value.Create(schema),
                },
            })
        );
    }
}

const validator = {
    input: TypeCompiler.Compile(ResourceList.Input),
    output: TypeCompiler.Compile(ResourceList.Output),
};

function validate<T extends TSchema>(data: unknown, validator: TypeCheck<T>) {
    if (validator.Check(data)) {
        return data;
    }
    throw new ValidationError(validator.Errors(data));
}

export function process(input: unknown) {
    const output = Value.Create(ResourceList.Output);
    try {
        const { functionConfig, items } = validate(input, validator.input);
        let source: string;
        let params: {};
        switch (functionConfig.kind) {
            case 'ConfigMap':
                ({ source, ...params } = functionConfig.data);
                params = Object.fromEntries(
                    Object.entries(params as Record<string, string>).map(([key, value]) => [key, YAML.parse(value)]),
                );
                break;
        }
        output.items = new Sandbox({ items, params }).eval(source);
        return validate(output, validator.output);
    } catch (err: unknown) {
        if (err instanceof ValidationError) {
            output.results = err.cause;
        } else if (err instanceof Error) {
            output.results.push(deepMerge<Result>(Value.Create(Result), {
                message: err.stack,
            }));
        } else {
            throw err;
        }
        return output;
    }
}