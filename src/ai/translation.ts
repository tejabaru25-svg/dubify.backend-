import axios from "axios";

/**
 * Translates text to the target language using OpenAI GPT API.
 * Handles multiple speaker segments from diarization.
 */

export async function translateSegments(
  segments: Array<{ speaker: string; text: string }>,
  targetLanguage: string
) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY");

    console.log(`🌍 Translating ${segments.length} segments to ${targetLanguage}...`);

    const translatedSegments = [];

    for (const seg of segments) {
      const prompt = `
      You are a professional film translator. 
      Translate this dialogue into ${targetLanguage} while preserving tone and style.
      Only return the translated sentence, nothing else.

      Original: "${seg.text}"
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // fast + cost-efficient model
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        },
        {
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      const translatedText =
        response.data.choices?.[0]?.message?.content?.trim() || seg.text;

      translatedSegments.push({
        ...seg,
        translatedText
      });

      console.log(`✅ ${seg.speaker}: "${translatedText}"`);
    }

    console.log("🌐 Translation completed.");
    return translatedSegments;
  } catch (err: any) {
    console.error("❌ Translation error:", err.message);
    throw err;
  }
}
