# Stage 1: Node.js base image for installing dependencies
FROM node:18.12.1 AS base

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --verbose

