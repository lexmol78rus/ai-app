FROM node:20

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

RUN npm install express cors dotenv @google/genai

EXPOSE 3001

CMD ["node", "server/server.js"]
