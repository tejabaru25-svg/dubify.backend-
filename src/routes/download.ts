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
      .select("output_url")
      .eq("id", jobId)
      .single();

    if (error || !data?.output_url)
      return res.status(404).json({ error: "Dubbed video not found" });

    res.redirect(data.output_url);
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ error: "Failed to get dubbed video" });
  }
});

export default router;
