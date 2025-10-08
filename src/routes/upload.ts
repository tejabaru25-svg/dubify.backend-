import express from "express";
import AWS from "aws-sdk";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// --- Initialize Supabase Client ---
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// --- Initialize AWS S3 (v2 SDK) ---
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || "eu-north-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4"
});

/**
 * POST /upload
 * Generate a signed S3 upload URL and store metadata in Supabase
 */
router.post("/", async (req, res) => {
  try {
    const { filename, filetype, uploader } = req.body;

    if (!filename || !filetype) {
      return res
        .status(400)
        .json({ error: "Missing required parameters: filename or filetype" });
    }

    // --- Define S3 object key ---
    const key = `uploads/${Date.now()}_${filename}`;

    // --- Create signed upload URL (expires in 5 mins) ---
    const uploadURL = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Expires: 300, // 5 minutes
      ContentType: filetype
    });

    // --- Save metadata in Supabase ---
    const { error: dbError } = await supabase.from("videos").insert([
      {
        file_name: filename,
        uploader: uploader || "anonymous",
        status: "uploaded",
        s3_key: key,
        created_at: new Date().toISOString()
      }
    ]);

    if (dbError) {
      console.error("❌ Supabase insert error:", dbError.message);
      throw new Error("Failed to save metadata in Supabase");
    }

    console.log(`✅ Upload URL created for: ${filename}`);

    res.json({
      status: "success",
      uploadURL,
      s3Key: key,
      expiresIn: "5 minutes"
    });
  } catch (err: any) {
    console.error("❌ Upload route error:", err.message);
    res.status(500).json({
      status: "error",
      message: "Upload failed",
      error: err.message
    });
  }
});

export default router;
