import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

import { FunctionConfig } from './function_config.ts';
import { K8sObject } from './k8s.ts';
import { Result } from './result.ts';

export const API_VERSION = 'config.kubernetes.io/v1';
export const KIND = 'ResourceList';

const ResourceListBase = Type.Object({
    apiVersion: Type.Literal(API_VERSION, {
        description: 'apiVersion of ResourceList',
    }),
    kind: Type.Literal(KIND, {
        description: 'kind of ResourceList i.e. `ResourceList`',
    }),
    items: Type.Array(K8sObject, {
        description: `
[input/output]
Items is a list of Kubernetes objects: 
https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#types-kinds).

A function will read this field in the input ResourceList and populate
this field in the output ResourceList.`.trim(),
    }),
}, {
    description: 'ResourceList is the input/output wire format for KRM functions',
});

export const ResourceList = {
    Input: Type.Intersect([
        ResourceListBase,
        Type.Object({
            functionConfig: Type.Intersect([
                FunctionConfig,
                Type.Object({}, {
                    description: `
[input]
FunctionConfig is an optional Kubernetes object for passing arguments to a
function invocation.`.trim(),
                }),
            ]),
        }),
    ]),
    Output: Type.Intersect([
        ResourceListBase,
        Type.Object({
            results: Type.Array(Result, {
                description: `
[output]
Results is an optional list that can be used by function to emit results
for observability and debugging purposes.`.trim(),
            }),
        }),
    ]),
};
export declare namespace ResourceList {
    type Input = Static<typeof ResourceList.Input>;
    type Output = Static<typeof ResourceList.Output>;
}
