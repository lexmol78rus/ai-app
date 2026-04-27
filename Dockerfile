FROM node:20

WORKDIR /app

# копируем всё
COPY . .

# ставим зависимости
RUN npm install

# собираем frontend
RUN npm run build

# открываем порт
EXPOSE 3001

# запускаем сервер
CMD ["node", "server/server.js"]
