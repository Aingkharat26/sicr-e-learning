export type AiMode = 'system' | 'learning';

export interface AiActionLink {
  label: string;
  url: string;
  icon?: string;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: AiMode;
  codeSnippet?: {
    language: string;
    code: string;
  };
  sources?: {
    title: string;
    url: string;
    type: 'course' | 'km' | 'system';
  }[];
  actions?: AiActionLink[];
}

export interface AiPromptSuggestion {
  text: string;
  mode: AiMode;
  icon: string;
}
