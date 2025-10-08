import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

/**
 * Runs multi-speaker diarization on an audio/video input.
 * Returns detected speakers and timestamps.
 */
export async function runDiarization(videoUrl: string) {
  try {
    console.log("🎧 Running diarization and speaker classification...");

    // Input to the diarization model
    const input = {
      audio: videoUrl, // can be video or audio link
    };

    // ✅ using lucataco/speaker-diarization model (fast + reliable)
    const output = await replicate.run(
      `lucataco/speaker-diarization:${process.env.REPLICATE_MODEL_VERSION}`,
      { input }
    );

    console.log("🧩 Diarization output:", output);

    // Format result if available
    if (Array.isArray(output)) {
      return output.map((seg: any, i: number) => ({
        speaker: seg.speaker || `Speaker ${i + 1}`,
        start: seg.start || 0,
        end: seg.end || 0,
        voiceType: seg.speaker?.toLowerCase().includes("female")
          ? "female"
          : "male",
      }));
    }

    console.log("✅ Diarization completed successfully");
    return output;
  } catch (err: any) {
    console.error("❌ Diarization failed:", err.message);
    throw new Error(`Replicate diarization failed: ${err.message}`);
  }
}
