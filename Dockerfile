FROM node:18
FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
WORKDIR /app

RUN chown -R node:node /app
USER node
RUN chmod 644 package.json
RUN chmod 644 package-lock.json

COPY package.json package-lock.json* ./

RUN npm install --verbose --legacy-peer-deps

COPY . .

CMD [ "node","aibotapi.js" ]
