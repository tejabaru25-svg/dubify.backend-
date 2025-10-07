import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

import { runDiarization } from "../ai/diarization.js";
import { translateSegments } from "../ai/translation.js";
import { generateVoices } from "../ai/voice.js";
import { runLipSync } from "../ai/lipsync.js";

dotenv.config();
const router = express.Router();

// 🧩 Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /dub
 * Full cinematic dubbing pipeline (Mini Level 3 MVP)
 * Saves job → runs AI pipeline → updates job record
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

    console.log("🎬 Starting Dubify dubbing pipeline...");
    console.log(`🎥 Video: ${videoUrl}`);
    console.log(`🌍 Target Language: ${targetLanguage}`);

    // 🧾 STEP 1: Create job record in Supabase
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert([
        {
          target_language: targetLanguage,
          status: "processing",
          output_url: null,
          error_message: null,
        },
      ])
      .select()
      .single();

    if (jobError) throw jobError;

    console.log(`🆕 Job created: ${job.id}`);

    // Optional logging helper
    const log = async (step: string, message: string) => {
      await supabase.from("logs").insert([
        { job_id: job.id, step, message }
      ]);
    };

    await log("start", "Dubbing process started.");

    // 🧩 STEP 2: Diarization
    await log("diarization", "Running diarization...");
    const diarized = await runDiarization(videoUrl);
    await log("diarization", `Detected ${diarized.length} speakers.`);

    // 🧩 STEP 3: Translation
    await log("translation", "Translating dialogue...");
    const transcript = diarized.map((spk) => ({
      speaker: spk.speaker,
      text: `Sample dialogue for ${spk.speaker}`,
      voiceType: spk.voiceType,
    }));
    const translated = await translateSegments(transcript, targetLanguage);
    await log("translation", "Translation completed.");

    // 🧩 STEP 4: Voice generation
    await log("voice", "Generating voices...");
    const voices = await generateVoices(translated);
    await log("voice", "Voice generation completed.");

    // 🧩 STEP 5: Lip-sync
    await log("lipsync", "Performing lip-sync dubbing...");
    const finalVideoUrl = await runLipSync(videoUrl, voices);
    await log("lipsync", "Lip-sync completed successfully.");

    // ✅ STEP 6: Update job record
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "done",
        output_url: finalVideoUrl,
        completed_at: new Date(),
      })
      .eq("id", job.id);

    if (updateError) throw updateError;

    await log("complete", "Dubbing job completed successfully.");

    console.log("✅ Dubbing job finished!");

    res.json({
      status: "success",
      message: "Dubify dubbing complete 🎬",
      jobId: job.id,
      output: {
        originalVideo: videoUrl,
        dubbedVideo: finalVideoUrl,
        language: targetLanguage,
        totalSpeakers: diarized.length,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("❌ Dubbing failed:", err.message);

    // Record failure in DB
    await supabase
      .from("jobs")
      .update({
        status: "failed",
        error_message: err.message,
      })
      .eq("status", "processing");

    res.status(500).json({
      status: "error",
      message: "Failed to process dubbing",
      error: err.message,
    });
  }
});

export default router;
