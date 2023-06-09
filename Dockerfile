# Stage 1: Load Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:20.5.0 AS puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Stage 2: Install Node modules
FROM node:18-alpine

WORKDIR /app    

COPY package*.json ./

# Install Node modules
RUN npm install

# Copy installed dependencies from Puppeteer image
COPY --from=puppeteer /node_modules /app/node_modules

# Copy the rest of your application code
COPY . .

# Set the startup command
CMD ["node", "aibotapi.js"]
