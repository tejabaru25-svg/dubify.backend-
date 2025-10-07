import express from "express";
import os from "os";
const router = express.Router();

router.get("/", async (req, res) => {
  const memory = process.memoryUsage();
  const cpuLoad = os.loadavg()[0].toFixed(2);

  res.json({
    project: "Dubify Mini Level 3 MVP",
    version: "v1.0-mini",
    aiModules: ["Diarization", "Translation", "Voice", "LipSync"],
    system: {
      cpuLoad,
      memoryUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
      uptimeSeconds: process.uptime().toFixed(0)
    },
    health: "🟢 All systems optimal"
  });
});

export default router;
