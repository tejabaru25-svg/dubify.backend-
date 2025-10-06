import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

// Route imports (remove .js extensions for TypeScript)
import homeRoutes from "./routes/home";
import uploadRoutes from "./routes/upload";
import dubRoutes from "./routes/dub";
import statusRoutes from "./routes/status";
import downloadRoutes from "./routes/download";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register all route groups
app.use("/home", homeRoutes);
app.use("/upload", uploadRoutes);
app.use("/dub", dubRoutes);
app.use("/status", statusRoutes);
app.use("/download", downloadRoutes);

// Root health check route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Dubify AI Backend is Live 🚀",
    version: "Level 3 Cinematic Dubbing",
    time: new Date().toISOString(),
  });
});

// Create HTTP server (for future WebSocket or scaling)
const port = Number(process.env.PORT) || 10000;
const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Dubify AI backend running on port ${port}`);
});
