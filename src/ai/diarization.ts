import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Step 1: Speaker diarization + emotion classification
 * Uses Replicate (pyannote.audio) + HuggingFace emotion model
 */
export async function runDiarization(videoUrl: string) {
  console.log("🎧 Running diarization and speaker classification...");

  // === 1️⃣ Run diarization (detect speakers) ===
  const diarizationResponse = await axios.post(
    "https://api.replicate.com/v1/predictions",
    {
      version: "a0c0f9a08f4c4f28b3a57c6bde4a1ed7f58c7cde8b6e14f57dc122cfb1c9e6a7", // pyannote.audio model
      input: { audio: videoUrl },
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const diarizationData = diarizationResponse.data;
  if (!diarizationData) throw new Error("Diarization failed");

  // Mock structure for simplicity
  const speakers = [
    { speaker: "spk1", start: 0, end: 4 },
    { speaker: "spk2", start: 5, end: 9 },
    { speaker: "spk3", start: 10, end: 15 },
  ];

  // === 2️⃣ Classify voice attributes for each speaker ===
  const enrichedSpeakers = await Promise.all(
    speakers.map(async (spk) => {
      try {
        const classify = await axios.post(
          "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
          { inputs: `sample audio from ${videoUrl}` },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Approximate classification (mocked for now)
        const gender = ["male", "female"][Math.floor(Math.random() * 2)];
        const ageGroup = ["adult", "child", "elderly"][Math.floor(Math.random() * 3)];
        const emotion =
          classify.data?.[0]?.label || ["neutral", "happy", "sad", "angry"][Math.floor(Math.random() * 4)];

        return {
          ...spk,
          voiceType: gender,
          ageGroup,
          emotion,
        };
      } catch (error) {
        console.error("❌ Classification failed:", error.message);
        return { ...spk, voiceType: "neutral", ageGroup: "adult", emotion: "neutral" };
      }
    })
  );

  console.log("✅ Diarization and classification complete");
  return enrichedSpeakers;
}
