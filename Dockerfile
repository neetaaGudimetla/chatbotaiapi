# Stage 1: Node.js base image for installing dependencies
FROM node:18-alpine

WORKDIR /usr/src/app    

COPY package*.json ./
RUN npm i --legacy-peer-deps
COPY . .

# Stage 2: Final image with Puppeteer
FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

CMD ["node", "aibotapi.js"]