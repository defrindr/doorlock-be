FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json yarn.lock ./
RUN corepack enable && corepack prepare yarn@3.6.4 --activate
RUN apk add --no-cache python3 make g++ pcsc-lite-dev
COPY . .
RUN yarn install
RUN yarn build
CMD ["node", "dist/main.js"]
