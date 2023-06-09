FROM node:18-alpine

WORKDIR /usr/src/app    

COPY package*.json ./
RUN npm i --legacy-peer-deps
COPY . .
CMD [ "node","aibotapi.js" ]