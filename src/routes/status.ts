import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await supabase
      .from("jobs")
      .select("id, status, progress, output_url, language, voice")
      .eq("id", jobId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Job not found" });

    res.json({ job: data });
  } catch (err) {
    console.error("Status Error:", err);
    res.status(500).json({ error: "Failed to fetch job status" });
  }
});

export default router;
