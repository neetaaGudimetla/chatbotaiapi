# Stage 1: Node.js base image for installing dependencies
FROM node:lts AS base

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --verbose

