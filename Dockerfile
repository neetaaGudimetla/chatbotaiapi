# Stage 1: Node.js base image for installing dependencies
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm cache clean --force
RUN npm install --legacy-peer-deps

