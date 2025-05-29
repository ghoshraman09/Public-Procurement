
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_PROMPT } from '../constants';
import { GroundingSource, WebGroundingChunk } from '../types';

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      throw new Error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const initChat = (): Chat | null => {
  try {
    const client = getAIClient();
    return client.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }], // Enable Google Search grounding
      },
    });
  } catch (error) {
    console.error("Error initializing chat:", error);
    return null;
  }
};

export const sendMessageStream = async (
  chat: Chat,
  message: string,
  onChunk: (textChunk: string, newSources: GroundingSource[]) => void,
  onComplete: () => void,
  onError: (errorMessage: string) => void
): Promise<void> => {
  try {
    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      // Type assertion for safety, though API should conform
      const typedChunk = chunk as GenerateContentResponse; 
      const text = typedChunk.text; // Use direct .text accessor
      
      const sources: GroundingSource[] = [];
      if (typedChunk.candidates && typedChunk.candidates[0] && typedChunk.candidates[0].groundingMetadata && typedChunk.candidates[0].groundingMetadata.groundingChunks) {
        typedChunk.candidates[0].groundingMetadata.groundingChunks.forEach(gc => {
          // Assuming gc structure based on common patterns, adjust if API differs
          const webChunk = gc as unknown as WebGroundingChunk; // Cast to check for web property
          if (webChunk.web && webChunk.web.uri && webChunk.web.title) {
            sources.push({ uri: webChunk.web.uri, title: webChunk.web.title });
          }
        });
      }
      onChunk(text, sources);
    }
    onComplete();
  } catch (error) {
    console.error("Error sending message stream:", error);
    if (error instanceof Error) {
      onError(error.message);
    } else {
      onError("An unknown error occurred during streaming.");
    }
  }
};
