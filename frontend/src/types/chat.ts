export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Suggestion {
  title: string;
  subtitle: string;
  prompt: string;
}
