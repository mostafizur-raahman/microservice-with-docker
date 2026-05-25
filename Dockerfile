FROM alpine:3.22

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000  

CMD ["node", "server.js"]