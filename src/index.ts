import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Root Route (for homepage backend check)
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Dubify AI Backend is Live 🚀",
    version: "Level 3 Cinematic Dubbing",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dubify AI backend running on port ${PORT}`);
});
