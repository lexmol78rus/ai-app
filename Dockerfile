FROM node:20

WORKDIR /app

# сначала зависимости
COPY package*.json ./
RUN npm install

# потом весь проект
COPY . .

# собираем frontend
RUN npm run build

# сервер
EXPOSE 3001

CMD ["node", "server/server.js"]
