import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route (for testing)
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Dubify AI Backend is Live 🚀",
    version: "Level 3 Cinematic Dubbing",
    time: new Date().toISOString(),
  });
});

// Use Render-assigned port
const PORT = process.env.PORT || 5000;

// Important: Add '0.0.0.0' for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Dubify AI backend running on port ${PORT}`);
});

