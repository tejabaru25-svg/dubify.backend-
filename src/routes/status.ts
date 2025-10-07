import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !data) return res.status(404).json({ error: "Job not found" });

    res.json({
      jobId,
      status: data.status,
      progress: data.progress || 0,
      output: data.output_url || null,
      updatedAt: data.updated_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
