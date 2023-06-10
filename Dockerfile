FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/app    

COPY package*.json ./

RUN npm ci

COPY . .

RUN chmod -R 777 /usr/app/uploads

CMD ["node", "aibotapi.js"]
