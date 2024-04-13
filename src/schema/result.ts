import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

import { K8sGvk } from './k8s.ts';
import { UnionEnum } from './union_enum.ts';

export const Result = Type.Object({
    message: Type.String({
        description: 'Message is a human readable message.',
    }),
    severity: Type.Optional(UnionEnum([
        'error',
        'warning',
        'info',
    ], {
        description: `
Severity is the severity of a result:

"error": indicates an error result.
"warning": indicates a warning result.
"info": indicates an informational result.`.trim(),
        default: 'error',
    })),
    resourceRef: Type.Optional(Type.Intersect([
        K8sGvk,
        Type.Object({
            name: Type.String({
                description: 'Name refers to the `metadata.name` field of the object manifest.',
            }),
            namespace: Type.Optional(Type.String({
                description: 'Namespace refers to the `metadata.namespace` field of the object manifest.',
            })),
        }, {
            description: 'ResourceRef is the metadata for referencing a Kubernetes object associated with a result.',
        }),
    ])),
    field: Type.Optional(Type.Object({
        path: Type.String({
            description: `
Path is the JSON path of the field
e.g. \`spec.template.spec.containers[3].resources.limits.cpu\``.trim(),
        }),
        currentValue: Type.Optional(Type.Any({
            description: `
CurrrentValue is the current value of the field.
Can be any value - string, number, boolean, array or object.`.trim(),
        })),
        proposedValue: Type.Optional(Type.Any({
            description: `
PropposedValue is the proposed value of the field to fix an issue.
Can be any value - string, number, boolean, array or object.`.trim(),
        })),
    }, {
        description:
            'Field is the reference to a field in the object. If defined, `ResourceRef` must also be provided.',
    })),
    file: Type.Optional(Type.Object({
        path: Type.String({
            description: `
Path is the OS agnostic, slash-delimited, relative path.
e.g. \`some-dir/some-file.yaml\`.`.trim(),
        }),
        index: Type.Optional(Type.Number({
            description: 'Index of the object in a multi-object YAML file.',
            default: 0,
        })),
    }, {
        description: 'File references a file containing the resource.',
    })),
    tags: Type.Optional(Type.Object({}, {
        description:
            'Tags is an unstructured key value map stored with a result that may be set by external tools to store and retrieve arbitrary metadata.',
        additionalProperties: Type.String(),
    })),
});
export type Result = Static<typeof Result>;
