import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route (to check backend live)
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Dubify AI Backend is Live 🚀",
    version: "Level 3 Cinematic Dubbing",
    time: new Date().toISOString()
  });
});

// ✅ Important: start server correctly for Render
const port = Number(process.env.PORT) || 5000;

// Create HTTP server for TypeScript + Render compatibility
const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Dubify AI backend running on port ${port}`);
});
