# Сборка фронтенда
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json .
COPY frontend ./frontend

RUN npm install -g serve
RUN npm ci
RUN npm run build:frontend

EXPOSE 5173

WORKDIR /app/frontend

CMD ["serve", "-s", "-l", "5173", "dist"]