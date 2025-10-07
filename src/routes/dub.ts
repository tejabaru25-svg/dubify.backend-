import express from "express";
import { runDiarization } from "../ai/diarization";
import { translateSegments } from "../ai/translation";
import { generateVoices } from "../ai/voice";
import { runLipSync } from "../ai/lipsync";

const router = express.Router();

/**
 * POST /dub
 * Full cinematic dubbing pipeline:
 * 1. Diarize speakers
 * 2. Translate each segment
 * 3. Generate AI voices
 * 4. Lip-sync video
 */
router.post("/", async (req, res) => {
  try {
    const { videoUrl, targetLanguage } = req.body;

    if (!videoUrl || !targetLanguage) {
      return res.status(400).json({
        error: "Missing required parameters: videoUrl, targetLanguage",
      });
    }

    console.log("🎬 Starting dubbing pipeline...");
    console.log("🎥 Video URL:", videoUrl);
    console.log("🌍 Target language:", targetLanguage);

    // STEP 1: Diarization (detect multiple speakers)
    const diarized = await runDiarization(videoUrl);

    // STEP 2: Generate fake transcript for demo
    const transcript = diarized.map((spk) => ({
      speaker: spk.speaker,
      text: `Sample dialogue for ${spk.speaker}.`,
      voiceType: spk.voiceType,
    }));

    // STEP 3: Translation
    const translated = await translateSegments(transcript, targetLanguage);

    // STEP 4: Voice generation
    const voices = await generateVoices(translated);

    // STEP 5: Lip sync
    const finalVideoUrl = await runLipSync(videoUrl, voices);

    console.log("✅ Dubbing pipeline completed successfully!");

    res.json({
      status: "success",
      message: "Dubify Mini Level 3 complete",
      output: {
        originalVideo: videoUrl,
        dubbedVideo: finalVideoUrl,
        language: targetLanguage,
        speakers: diarized.length,
      },
    });
  } catch (err: any) {
    console.error("❌ Dubbing pipeline failed:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to process dubbing",
      error: err.message,
    });
  }
});

export default router;
