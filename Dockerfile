FROM node:20-alpine

WORKDIR /app

# Install dockercli so backend can spawn runner containers on host docker
RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
