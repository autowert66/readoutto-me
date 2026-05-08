FROM denoland/deno:alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json deno.lock ./
RUN deno install --frozen

# copy public first since it is changed less often, so that more layers remain cached
COPY public public
COPY src src

EXPOSE 8080

CMD ["deno", "task", "start"]
