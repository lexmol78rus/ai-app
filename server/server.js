import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

// можно без ограничений, чтобы точно работало
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, calorieGoal } = req.body;

    const goalContext = calorieGoal
      ? `\n\nТекущая цель пользователя по калориям: ${calorieGoal} ккал в день.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages,
      config: {
        systemInstruction: "Ты диетолог." + goalContext,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 👉 ОТДАЁМ FRONTEND
app.use(express.static(path.join(process.cwd(), "dist")));

// 👉 ВАЖНО: для React (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

// запуск сервера
app.listen(3001, "0.0.0.0", () => {
  console.log("Backend running on 3001");
});
