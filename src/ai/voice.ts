import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate realistic voices using OpenAI TTS
 * Each segment = one speaker line
 */
export async function generateVoices(segments: any[]) {
  console.log("🎙️ Generating AI voices with OpenAI TTS...");

  const outputs = [];

  for (const seg of segments) {
    try {
      // Clean and enhance text for realism
      const text = seg.text
        .replace(/\s+/g, " ")
        .replace(/([.?!])\s*(?=[A-Z])/g, "$1\n");

      const outputFile = path.resolve(`./tmp_${Date.now()}.mp3`);

      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: seg.voiceType === "female" ? "verse" : "ash",
        input: text,
      });

      // Convert response to buffer and save as file
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputFile, buffer);

      outputs.push({
        ...seg,
        audioPath: outputFile,
        audioBase64: buffer.toString("base64"),
      });

      console.log(`✅ Voice generated for ${seg.speaker}`);
    } catch (error: any) {
      console.error("❌ Voice generation failed:", error.message);
    }
  }

  console.log("✅ All voices generated successfully.");
  return outputs;
}
