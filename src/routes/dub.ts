import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const router = express.Router();

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// POST /dub
router.post("/", async (req, res) => {
  try {
    const { videoUrl, targetLanguage, voiceType } = req.body;

    if (!videoUrl || !targetLanguage || !voiceType) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Save job in Supabase
    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert([{ video_url: videoUrl, language: targetLanguage, voice: voiceType, status: "pending" }])
      .select()
      .single();

    if (dbError) throw dbError;

    // Send to Hugging Face AI worker
    await axios.post(process.env.WORKER_URL!, {
      jobId: job.id,
      videoUrl,
      targetLanguage,
      voiceType
    });

    res.json({ message: "Job started", jobId: job.id });
  } catch (err) {
    console.error("Dub Error:", err);
    res.status(500).json({ error: "Failed to start dubbing job" });
  }
});

export default router;
