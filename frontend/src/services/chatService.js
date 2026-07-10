import axios from "axios";

// Target port 8002 of the AI service, defaulting to local host when running outside of docker
const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8002/api/v1";

const aiApi = axios.create({
  baseURL: AI_API_URL,
});

// Attach JWT token automatically for requests
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendMessage = async (prompt) => {
  const response = await aiApi.post("/chat", { prompt });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await aiApi.get("/chat/history");
  return response.data.history;
};

export const clearChatHistory = async () => {
  const response = await aiApi.delete("/chat/history");
  return response.data;
};
