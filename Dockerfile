FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

RUN apt-get update && \
    apt-get install -y \
    chromium \
    libxss1 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils

RUN npm install puppeteer

COPY . .

CMD ["node", "app.js"]
