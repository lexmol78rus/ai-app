export async function chatWithNutritionist(messages: any[], calorieGoal?: number) {
  try {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, calorieGoal }),
    });

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Ошибка:", error);
    return "Ошибка соединения с сервером";
  }
}