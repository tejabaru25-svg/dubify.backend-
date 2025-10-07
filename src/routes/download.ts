import express from "express";
import { createClient } from "@supabase/supabase-js";
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await supabase
      .from("jobs")
      .select("output_url, language, created_at")
      .eq("id", jobId)
      .single();

    if (error || !data) return res.status(404).json({ error: "Result not found" });

    res.json({
      status: "success",
      message: "Dubbed video ready 🎬",
      outputUrl: data.output_url,
      language: data.language,
      createdAt: data.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
