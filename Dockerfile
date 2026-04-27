FROM node:18

WORKDIR /app

# копируем только backend
COPY server ./server
COPY package.json ./

RUN npm install express cors dotenv @google/genai

EXPOSE 3001

CMD ["node", "server/server.js"]