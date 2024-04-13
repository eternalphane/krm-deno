# syntax=docker/dockerfile:latest

ARG DENO_VERSION=1.42.3
ARG DENO_IMAGE=denoland/deno:${DENO_VERSION}
ARG DENO_AUTH_TOKENS

FROM ${DENO_IMAGE} AS build

WORKDIR /src
SHELL [ "/bin/bash", "-xec" ]

COPY --link . .

ARG DENO_AUTH_TOKENS

RUN apt update
RUN apt install -y --no-install-recommends unzip
RUN --mount=type=cache,target=/deno-dir \
    deno task cache
RUN --mount=type=cache,target=/deno-dir \
    deno task build

FROM gcr.io/distroless/cc-debian12:nonroot AS final

COPY --link --from=build /src/dist/app /app

ENTRYPOINT [ "/app" ]
