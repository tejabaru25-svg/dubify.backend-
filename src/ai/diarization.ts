import axios from "axios";

export async function runDiarization(audioUrl: string) {
  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    const replicateModelVersion = process.env.REPLICATE_MODEL_VERSION;

    if (!replicateToken || !replicateModelVersion) {
      throw new Error("Missing REPLICATE_API_TOKEN or REPLICATE_MODEL_VERSION");
    }

    console.log("🎧 Running diarization and speaker classification...");

    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: replicateModelVersion,
        input: {
          audio: audioUrl,
        },
      },
      {
        headers: {
          Authorization: `Token ${replicateToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if replicate returned output URL
    if (response.data?.urls?.get) {
      console.log("🕒 Diarization job submitted, fetching results...");
      const resultUrl = response.data.urls.get;

      // Poll for completion
      let output;
      while (true) {
        const statusResp = await axios.get(resultUrl, {
          headers: { Authorization: `Token ${replicateToken}` },
        });

        if (statusResp.data.status === "succeeded") {
          output = statusResp.data.output;
          break;
        }
        if (statusResp.data.status === "failed") {
          throw new Error("Diarization failed on Replicate");
        }

        await new Promise((r) => setTimeout(r, 5000)); // wait 5s
      }

      console.log("✅ Diarization complete!");
      return output;
    } else {
      throw new Error("Replicate API did not return a valid output URL");
    }
  } catch (err: any) {
    console.error("❌ Diarization error:", err.message);
    throw err;
  }
}
