FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm install axios

COPY . .

RUN mkdir -p uploads/incidents uploads/profiles

EXPOSE 5000

CMD ["node", "server.js"]

