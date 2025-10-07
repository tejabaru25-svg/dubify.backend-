import express from "express";
import { runDiarization } from "../ai/diarization.js";
import { translateSegments } from "../ai/translation.js";
import { generateVoices } from "../ai/voice.js";
import { runLipSync } from "../ai/lipsync.js";

const router = express.Router();

/**
 * POST /dub
 * Full cinematic dubbing pipeline (Mini Level 3 MVP)
 * 1. Diarize speakers
 * 2. Translate dialogue
 * 3. Generate voice
 * 4. Lip-sync final output
 */
router.post("/", async (req, res) => {
  try {
    const { videoUrl, targetLanguage } = req.body;

    if (!videoUrl || !targetLanguage) {
      return res.status(400).json({
        status: "error",
        message: "Missing required parameters: videoUrl, targetLanguage",
      });
    }

    console.log("🎬 Starting Dubify Level 3 Dubbing Pipeline...");
    console.log(`🎥 Video: ${videoUrl}`);
    console.log(`🌍 Target Language: ${targetLanguage}`);

    // STEP 1: Speaker Diarization
    console.log("🧩 Step 1: Running Diarization...");
    const diarized = await runDiarization(videoUrl);
    console.log(`✅ Found ${diarized.length} speaker(s)`);

    // STEP 2: Generate mock transcript (placeholder for Whisper)
    const transcript = diarized.map((spk) => ({
      speaker: spk.speaker,
      text: `Sample dialogue for ${spk.speaker}`,
      voiceType: spk.voiceType,
    }));

    // STEP 3: Translation
    console.log("🌐 Step 2: Translating segments...");
    const translated = await translateSegments(transcript, targetLanguage);
    console.log("✅ Translation complete");

    // STEP 4: Voice generation
    console.log("🎙️ Step 3: Generating voices...");
    const voices = await generateVoices(translated);
    console.log("✅ Voice generation complete");

    // STEP 5: Lip-sync dubbing
    console.log("💋 Step 4: Running Wav2Lip sync...");
    const finalVideoUrl = await runLipSync(videoUrl, voices);
    console.log("✅ Lip-sync completed successfully!");

    // Final response
    res.json({
      status: "success",
      message: "Dubify Mini Level 3 dubbing complete 🎬",
      result: {
        originalVideo: videoUrl,
        dubbedVideo: finalVideoUrl,
        language: targetLanguage,
        totalSpeakers: diarized.length,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("❌ Dubbing pipeline failed:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to process dubbing request",
      error: err.message,
    });
  }
});

export default router;
