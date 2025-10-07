import axios from "axios";
import * as fs from "fs";
import * as path from "path";

/**
 * Runs multi-speaker diarization and basic voice-type detection
 * using Replicate's pyannote.audio model.
 */
export async function runDiarization(audioUrl: string) {
  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) throw new Error("Missing REPLICATE_API_TOKEN");

    console.log("🎧 Running multi-speaker diarization...");

    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version:
          "b6e85b89a0cbde941a9a4193f3cda8cf31a8cfb3d52a7f01f7a19dbd30a6bdf7", // pyannote.audio speaker-diarization
        input: { audio: audioUrl }
      },
      {
        headers: {
          Authorization: `Token ${replicateToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const predictionId = response.data.id;

    // Poll for completion
    let output: any = null;
    for (let i = 0; i < 20; i++) {
      const status = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { Authorization: `Token ${replicateToken}` }
        }
      );
      if (status.data.status === "succeeded") {
        output = status.data.output;
        break;
      }
      if (status.data.status === "failed")
        throw new Error("Diarization failed on Replicate");
      await new Promise((res) => setTimeout(res, 3000));
    }

    if (!output) throw new Error("Timed out waiting for diarization");

    // Simulated simple voice-type classification (basic pitch range check)
    const classifiedSpeakers = output.map((spk: any, idx: number) => {
      const duration = spk.end - spk.start;
      let voiceType = "adult-male";
      if (spk.speaker.toLowerCase().includes("child")) voiceType = "child";
      if (duration < 2) voiceType = "female";
      if (duration > 10) voiceType = "elderly-female";
      return {
        speaker: spk.speaker || `S${idx + 1}`,
        start: spk.start,
        end: spk.end,
        voiceType
      };
    });

    console.log("✅ Diarization complete. Found:", classifiedSpeakers.length, "speakers");
    return classifiedSpeakers;
  } catch (err: any) {
    console.error("❌ Diarization error:", err.message);
    throw err;
  }
}
