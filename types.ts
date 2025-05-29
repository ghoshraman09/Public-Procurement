
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  sources?: GroundingSource[];
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

// This is the expected structure of a web grounding chunk from Gemini API
export interface WebGroundingChunk {
  web: GroundingSource;
}
