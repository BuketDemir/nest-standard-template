export interface IXXXRequest {
  name?: string;
  model?: string;
  prompt?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
  stream?: boolean;
}
