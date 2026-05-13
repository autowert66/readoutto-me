FROM denoland/deno:alpine as base

WORKDIR /app

COPY package.json deno.json deno.lock ./

FROM base AS builder

RUN deno install --frozen

COPY web web

RUN deno task build

FROM base

ENV NODE_ENV=production

RUN deno install --frozen

# copy public first since it is changed less often, so that more layers remain cached
COPY public public
COPY src src

COPY --from=builder /app/dist web

EXPOSE 8080

CMD ["deno", "task", "start"]
