FROM denoland/deno:latest AS base

WORKDIR /app

COPY package.json deno.json deno.lock ./

FROM base AS builder

RUN deno install --frozen

COPY vite.config.js ./
COPY web web
COPY public public

RUN deno task build

FROM base

ENV NODE_ENV=production
ENV PORT=8080

RUN deno install --frozen

COPY src src

COPY --from=builder /app/dist dist

RUN mkdir data

EXPOSE $PORT

CMD ["deno", "task", "start"]
