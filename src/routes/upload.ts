import express from "express";
import AWS from "aws-sdk";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

router.post("/", async (req, res) => {
  try {
    const { filename, filetype, uploader } = req.body;
    if (!filename || !filetype) return res.status(400).json({ error: "Missing filename or type" });

    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `uploads/${Date.now()}_${filename}`,
      Expires: 300,
      ContentType: filetype
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);

    // Store metadata in Supabase
    await supabase.from("videos").insert([
      {
        file_name: filename,
        uploader,
        status: "uploaded",
        s3_key: params.Key
      }
    ]);

    res.json({ uploadURL, key: params.Key });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
