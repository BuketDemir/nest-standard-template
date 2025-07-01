export interface IZzzMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IZzzRequest {
  model: string;
  messages: IZzzMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
} 