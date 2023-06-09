FROM node:18
FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN npm i
CMD [ "node","aibotapi.js" ]
