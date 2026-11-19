FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_API_URL=https://ihirwepay.benofinance.rw/api/v1
ARG VITE_STORAGE_URL=https://ihirwepay.benofinance.rw
ARG VITE_GOOGLE_CLIENT_ID=851412910623-cqq5dj652m3qmu71c56ak4626rop4jka.apps.googleusercontent.com

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STORAGE_URL=$VITE_STORAGE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

