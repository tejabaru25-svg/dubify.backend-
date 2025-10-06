import express from "express";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Generate presigned upload URL
router.get("/presign", async (req, res) => {
  try {
    const { filename, filetype } = req.query;
    if (!filename || !filetype)
      return res.status(400).json({ error: "filename and filetype required" });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `uploads/${Date.now()}_${filename}`,
      ContentType: filetype,
      Expires: 300, // 5 mins
    };

    const url = await s3.getSignedUrlPromise("putObject", params);
    res.json({ uploadUrl: url, filePath: params.Key });
  } catch (error) {
    console.error("Presign Error:", error);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

export default router;
