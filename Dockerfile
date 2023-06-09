FROM node:18
FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app    

COPY package*.json ./
RUN npm install -g npm@9.7.1
RUN npm i --legacy-peer-deps
COPY . .
CMD [ "node","aibotapi.js" ]
