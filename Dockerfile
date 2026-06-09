FROM denoland/deno:latest AS base

WORKDIR /app

COPY package.json deno.json deno.lock ./

FROM base AS builder

RUN deno install --frozen

COPY vite.config.js postcss.config.js ./
COPY web web
COPY public public

RUN deno task build

FROM base

ENV NODE_ENV=production

RUN deno install --frozen

COPY src src

COPY --from=builder /app/dist dist

RUN mkdir data


EXPOSE 8080

CMD ["deno", "task", "start"]
