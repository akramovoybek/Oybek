FROM node:20-alpine

WORKDIR /app

# Install dockercli so backend can spawn runner containers on host docker
RUN apk add --no-cache docker-cli

# Copy everything
COPY . .

# Install backend dependencies
RUN npm install --production

# Install frontend dependencies and build
RUN npm install --prefix frontend
RUN npm run build --prefix frontend

EXPOSE 3000

CMD ["node", "src/app.js"]
