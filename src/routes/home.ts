import express, { Request, Response } from "express";

const router = express.Router();

/**
 * GET /
 * Health check route for the Dubify AI backend.
 * Confirms that the server is live and functioning correctly.
 */
router.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Welcome to Dubify AI Backend 🎬",
    version: "Level 3 Cinematic Dubbing",
    time: new Date().toISOString()
  });
});

/**
 * GET /status
 * Returns system-level operational data for monitoring.
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    system: "online",
    ai_engine: "Level 3 Dubbing Core",
    voice_models: "Multi-speaker, age & gender adaptive",
    lip_sync: "Real-time Wav2Lip enabled",
    translation_engine: "OpenAI Whisper + ElevenLabs sync",
    message: "Dubify AI backend system operational ✅",
    timestamp: new Date().toISOString()
  });
});

export default router;

