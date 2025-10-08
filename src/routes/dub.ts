import express from "express";
import { runDiarization } from "../ai/diarization.js";
import { translateSegments } from "../ai/translation.js";
import { generateVoices } from "../ai/voice.js";
import { runLipSync } from "../ai/lipsync.js";

const router = express.Router();

/**
 * POST /dub
 * Dubify Mini Level 3 Pipeline:
 * 1. Diarization (detect speakers)
 * 2. Translation (convert text)
 * 3. Voice generation (AI dubbing)
 * 4. Lip-sync (align voices)
 */
router.post("/", async (req, res) => {
  try {
    const { videoUrl, targetLanguage } = req.body;

    if (!videoUrl || !targetLanguage) {
      return res.status(400).json({
        status: "error",
        error: "Missing required parameters: videoUrl, targetLanguage",
      });
    }

    console.log("🎬 Starting Dubify dubbing pipeline...");
    console.log("🎥 Video URL:", videoUrl);
    console.log("🌍 Target Language:", targetLanguage);

    // STEP 1: Diarization
    const diarized: any[] = await runDiarization(videoUrl);

    if (!Array.isArray(diarized) || diarized.length === 0) {
      throw new Error("Diarization returned no speakers.");
    }

    console.log(`👥 Found ${diarized.length} speakers.`);

    // STEP 2: Build temporary transcript
    const transcript = diarized.map((spk: any, i: number) => ({
      speaker: spk.speaker || `Speaker ${i + 1}`,
      text: `Sample dialogue for ${spk.speaker || `Speaker ${i + 1}`}.`,
      voiceType: spk.voiceType || "neutral",
    }));

    console.log(`📝 Transcript created for ${transcript.length} segments.`);

    // STEP 3: Translation
    const translated = await translateSegments(transcript, targetLanguage);

    if (!Array.isArray(translated) || translated.length === 0) {
      throw new Error("Translation failed or returned no content.");
    }

    console.log(`🌐 Translated ${translated.length} segments.`);

    // STEP 4: AI Voice Generation
    const voices = await generateVoices(translated);

    if (!Array.isArray(voices) || voices.length === 0) {
      throw new Error("Voice generation failed.");
    }

    console.log(`🎤 Generated ${voices.length} voice tracks.`);

    // STEP 5: Lip Sync Video
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
