FROM node:20

WORKDIR /app

# зависимости
COPY package*.json ./
RUN npm install

# копируем ВСЁ (включая src)
COPY . .

# собираем frontend
RUN npm run build

EXPOSE 3001

CMD ["node", "server/server.js"]
