import Replicate from "replicate";

export async function runDiarization(videoUrl: string) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("Missing REPLICATE_API_TOKEN in environment variables.");
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    console.log("🎧 Running speaker diarization with Replicate...");

    const input = {
      audio: videoUrl, // must be a direct audio URL
    };

    const output = await replicate.run(
      "lucataco/speaker-diarization:718182bfdc7c91943c69ed0ac18ebe99a76fdde67ccd01fced347d8c3b8c15a6",
      { input }
    );

    console.log("✅ Diarization completed successfully.");

    if (Array.isArray(output)) return output;
    if (typeof output === "object") return [output];
    return [];
  } catch (err: any) {
    console.error("❌ Diarization error:", err.message);

    if (err.response?.status === 403) {
      console.error(
        "🚫 403 Forbidden: Your Replicate API token may be invalid or missing permissions."
      );
      console.error(
        "➡️ Go to https://replicate.com/account/api-tokens and regenerate a fresh token."
      );
    }

    throw err;
  }
}
