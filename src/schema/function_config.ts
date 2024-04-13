import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

export const FunctionConfig = Type.Union([
    Type.Object({
        apiVersion: Type.Literal('v1'),
        kind: Type.Literal('ConfigMap'),
        metadata: Type.Object({}, { additionalProperties: true }),
        data: Type.Object({
            source: Type.String(),
        }, { additionalProperties: Type.String() }),
    }),
]);
export type FunctionConfig = Static<typeof FunctionConfig>;
