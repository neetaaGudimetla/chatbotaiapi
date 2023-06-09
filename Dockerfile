# Stage 1: Load Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:20.5.0 AS puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Stage 2: Install Node modules
FROM node:18-alpine

# Install Google Chrome Stable
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    apt-get update && \
    apt-get install -yq google-chrome-stable

WORKDIR /usr/src/app    

COPY package*.json ./

# Install Node modules
RUN npm i --legacy-peer-deps

# Copy the rest of your application code
COPY . .

# Set the startup command
CMD ["node", "aibotapi.js"]