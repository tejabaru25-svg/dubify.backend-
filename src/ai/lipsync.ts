import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * Runs Wav2Lip model on Replicate to sync lips with generated audio.
 * Combines multiple speaker audio segments into a single dubbed video.
 */

export async function runLipSync(
  videoUrl: string,
  audioSegments: Array<{ speaker: string; filePath: string }>
) {
  try {
    const replicateKey = process.env.REPLICATE_API_TOKEN;
    if (!replicateKey) throw new Error("Missing REPLICATE_API_TOKEN");

    console.log("💋 Starting lip-sync with Wav2Lip...");

    // Combine all generated audio files into one continuous track (rough merge)
    const mergedAudio = path.resolve("merged_dub_audio.mp3");
    const audioBuffers = audioSegments.map(seg => fs.readFileSync(seg.filePath));
    fs.writeFileSync(mergedAudio, Buffer.concat(audioBuffers));

    // Upload merged audio to somewhere accessible (e.g. S3 or temp URL)
    // For now, assume audio is accessible via public URL
    // In production we will integrate this with S3 upload route

    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version:
          "e22e4e8f47b17cbd837e5a1a63f6fd3b49a68e4ce23ef6c48de5ab11d6bbaa24", // Wav2Lip model
        input: {
          video: videoUrl,
          audio: mergedAudio
        }
      },
      {
        headers: {
          Authorization: `Token ${replicateKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const predictionId = response.data.id;

    // Poll for output
    let outputUrl: string | null = null;
    for (let i = 0; i < 30; i++) {
      const status = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { Authorization: `Token ${replicateKey}` }
        }
      );

      if (status.data.status === "succeeded") {
        outputUrl = status.data.output?.[0];
        break;
      }

      if (status.data.status === "failed") {
        throw new Error("Lip-sync failed on Replicate");
      }

      await new Promise((res) => setTimeout(res, 5000)); // wait 5s
    }

    if (!outputUrl) throw new Error("Timed out waiting for lip-sync output");

    console.log("🎬 Lip-sync complete. Final video URL:", outputUrl);
    return outputUrl;
  } catch (err: any) {
    console.error("❌ Lip-sync error:", err.message);
    throw err;
  }
}
