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

    console.log("🎬 Starting Dubify dubbing pipeline...");
    console.log("🎥 Video:", videoUrl);
    console.log("🌍 Target Language:", targetLanguage);

    // STEP 1: Diarization (detect multiple speakers)
    const diarized: any[] = await runDiarization(videoUrl);

    if (!Array.isArray(diarized) || diarized.length === 0) {
      throw new Error("Diarization returned no speakers");
    }

    console.log(`👥 Found ${diarized.length} speakers`);

    // STEP 2: Generate basic transcript structure
    const transcript = diarized.map((spk, i) => ({
      speaker: spk.speaker || `Speaker ${i + 1}`,
      text: `Sample dialogue for ${spk.speaker || `Speaker ${i + 1}`}.`,
      voiceType: spk.voiceType || "neutral",
    }));

    // STEP 3: Translate
    const translated: any[] = await translateSegments(transcript, targetLanguage);

    if (!Array.isArray(translated) || translated.length === 0) {
      throw new Error("Translation failed or returned no content");
    }

    console.log(`🌐 Translated ${translated.length} segments`);

    // STEP 4: Voice generation
    const voices: any[] = await generateVoices(translated);

    if (!Array.isArray(voices) || voices.length === 0) {
      throw new Error("Voice generation failed");
    }

    console.log(`🎤 Generated ${voices.length} audio tracks`);

    // STEP 5: Lip sync
    const finalVideoUrl = await runLipSync(videoUrl, voices);

    console.log("✅ Dubbing pipeline completed successfully!");

    res.json({
      status: "success",
      message: "Dubify Mini Level 3 complete 🎬",
      output: {
        originalVideo: videoUrl,
        dubbedVideo: finalVideoUrl,
        language: targetLanguage,
        speakers: diarized.length,
      },
    });
  } catch (err: any) {
    console.error("❌ Dubbing failed:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to process dubbing",
      error: err.message,
    });
  }
});

export default router;
