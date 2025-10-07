import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * Generates voice for each translated speaker segment.
 * Supports ElevenLabs or OpenAI TTS fallback.
 */

export async function generateVoices(
  translatedSegments: Array<{ speaker: string; translatedText: string; voiceType: string }>
) {
  try {
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!elevenKey && !openaiKey) throw new Error("Missing TTS API keys");

    console.log(`🎤 Generating voices for ${translatedSegments.length} segments...`);

    const audioOutputs: Array<{ speaker: string; filePath: string }> = [];

    for (const seg of translatedSegments) {
      let voiceFile = path.resolve(`tmp_${seg.speaker}.mp3`);
      let ttsUrl = "";

      // Voice selection based on age/gender
      let voicePreset = "Adam";
      if (seg.voiceType === "child") voicePreset = "Charlie";
      else if (seg.voiceType === "adult-female") voicePreset = "Bella";
      else if (seg.voiceType === "elderly-female") voicePreset = "Dorothy";

      console.log(`🗣️ ${seg.speaker} (${seg.voiceType}) → ${voicePreset}`);

      if (elevenKey) {
        // ElevenLabs TTS
        const voiceResponse = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voicePreset}`,
          {
            text: seg.translatedText,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.4, similarity_boost: 0.7 }
          },
          {
            headers: {
              "xi-api-key": elevenKey,
              "Content-Type": "application/json"
            },
            responseType: "arraybuffer"
          }
        );

        fs.writeFileSync(voiceFile, Buffer.from(voiceResponse.data), "binary");
      } else if (openaiKey) {
        // OpenAI TTS fallback
        const voiceResponse = await axios.post(
          "https://api.openai.com/v1/audio/speech",
          {
            model: "gpt-4o-mini-tts",
            voice: seg.voiceType.includes("female") ? "alloy" : "verse",
            input: seg.translatedText
          },
          {
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              "Content-Type": "application/json"
            },
            responseType: "arraybuffer"
          }
        );

        fs.writeFileSync(voiceFile, Buffer.from(voiceResponse.data), "binary");
      }

      audioOutputs.push({
        speaker: seg.speaker,
        filePath: voiceFile
      });
    }

    console.log("✅ Voice generation completed for all speakers.");
    return audioOutputs;
  } catch (err: any) {
    console.error("❌ Voice generation error:", err.message);
    throw err;
  }
}
