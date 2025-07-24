
FROM node:24-alpine

WORKDIR /app

COPY package*.json .
COPY backend ./backend

RUN npm ci
RUN npm run build:backend

EXPOSE 3000

WORKDIR /app/backend

CMD ["node", "dist/main"]