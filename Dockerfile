# Stage 1: Node.js base image for installing dependencies
FROM node:18 AS base

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --verbose

# Stage 2: Final image with Puppeteer
FROM ghcr.io/puppeteer/puppeteer:20.5.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY --from=base /app /app

# Copy the rest of your application code if needed

CMD ["node", "aibotapi.js"]