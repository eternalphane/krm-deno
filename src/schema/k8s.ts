import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

export const K8sGvk = Type.Object({
    apiVersion: Type.String(),
    kind: Type.String(),
});
export type K8sGvk = Static<typeof K8sGvk>;

export const K8sObject = Type.Intersect([
    K8sGvk,
    Type.Object({
        metadata: Type.Object({}, { additionalProperties: true }),
        spec: Type.Optional(Type.Object({}, { additionalProperties: true })),
    }),
]);
export type K8sObject = Static<typeof K8sObject>;
