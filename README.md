# <a href="https://readoutto.me/" target="_blank"><picture><source srcset="/public/logo-dark.png" media="(prefers-color-scheme: dark)"><img height="66" src="/public/logo.png" alt="ReadOutTo.me"></picture></a>

[![GitHub License](https://img.shields.io/github/license/autowert66/readoutto-me?label=License&style=for-the-badge)](https://github.com/autowert66/readoutto-me/blob/main/LICENSE)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/autowert66/readoutto-me/playwright.yml.svg?label=Tests&style=for-the-badge)](https://github.com/autowert66/readoutto-me/actions/workflows/playwright.yml?query=branch%3Amain)
[![Deno Version](https://img.shields.io/badge/Deno-^2.8.0-blue.svg?style=for-the-badge)](https://deno.com/)
[![msedge-tts dependency version](https://img.shields.io/github/package-json/dependency-version/autowert66/readoutto-me/msedge-tts?style=for-the-badge)](https://npmx.dev/package/msedge-tts)
[![beer css dependency version](https://img.shields.io/github/package-json/dependency-version/autowert66/readoutto-me/beercss?color=yellow&style=for-the-badge)](https://npmx.dev/package/beercss)
[![Built with Love](https://img.shields.io/badge/Built_With-Love-red.svg?style=for-the-badge)](https://gist.githubusercontent.com/autowert66/5339a9feba12bb73408d20fd06d2833d/raw/love.txt)
[![Better Stack Uptime](https://img.shields.io/endpoint?url=https%3A%2F%2Frtome-badge.autowert66.workers.dev%2F%3Fid%3D2qbl1&style=for-the-badge)](https://status.readoutto.me)

Read out any text online. Paste, select language, generate. That's it.

See the [full list of features](#features).

## TL;DR

Live page is available at [readoutto.me](https://readoutto.me/). Run locally like this:

```bash
git clone https://github.com/autowert66/readoutto-me.git && cd readoutto-me
docker compose up --build # http://localhost:8023/
# or for development
deno install && deno task dev # http://localhost:8080/
```

## Features

- ✳️ High quality, natural sounding voices backed by Azure Speech
- 🌐 Support for 142 different languages and regions
- 🗣️ Multiple voices per language, among female and male speakers
- 📝 Paste or upload any text or markdown
- 🔗 Extract text from blog posts or articles by pasting the link
- 〰️ Streaming responses for incredibly low Time To First Audio
- ⬇️ Download generated speech for offline playback, use in content creation...
- 🧠 Automatic language detection suggests likely languages of the text before read
- ⚙️ Modern webm + opus audio codec for high audible quality at low bitrates
- 🧱 Simple API, easy to integrate into other applications or with coding agents

## Run the application

Install Deno by following the
[official instructions](https://docs.deno.com/runtime/getting_started/installation/).

Execute in the project folder:

```bash
deno install
deno task start
```

The application will be running on [localhost:8080](http://localhost:8080/)
