import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

// Route imports
import homeRoutes from "./routes/home.js";
import uploadRoutes from "./routes/upload.js";
import dubRoutes from "./routes/dub.js";
import statusRoutes from "./routes/status.js";
import downloadRoutes from "./routes/download.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Register API routes
app.use("/home", homeRoutes);
app.use("/upload", uploadRoutes);
app.use("/dub", dubRoutes);
app.use("/status", statusRoutes);
app.use("/download", downloadRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Dubify Mini Level 3 Backend is Live 🚀",
    version: "v1.0-mini",
    time: new Date().toISOString()
  });
});

const port = Number(process.env.PORT) || 5000;
const server = http.createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Dubify Mini Level 3 backend running on port ${port}`);
});
