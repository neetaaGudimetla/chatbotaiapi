FROM node:18
FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --verbose --legacy-peer-deps

COPY . .

CMD [ "node","aibotapi.js" ]
