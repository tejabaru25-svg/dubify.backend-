import express, { Request, Response } from "express";

const router = express.Router();

router.get("/status", async (_req: Request, res: Response) => {
  res.json({
    system: "online",
    uptime: process.uptime(),
    message: "Dubify AI backend system operational ✅"
  });
});

router.get("/info", async (_req: Request, res: Response) => {
  res.json({
    supported_languages: ["English", "Hindi", "Spanish", "French", "Japanese"],
    supported_voices: [
      { name: "Cinematic Male" },
      { name: "Cinematic Female" },
      { name: "Young Boy" },
      { name: "Elderly Woman" }
    ],
    version: "Level 3 Cinematic Dubbing"
  });
});

export default router;
