import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'ping',
    });
    console.log("Response with gemini-3.6-flash:", response.text);
  } catch(e) {
    console.error("Error with gemini-3.6-flash:", e);
  }
}
test();
