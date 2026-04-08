export type RagResponse = {
  answer: string;
  tokens_used: number;
  latency_ms: number;
  context_preview: string[];
  total_rows_sent: number;
  total_rows_available: number;
};

export type AgentStep = {
  tool_name: string;
  arguments: Record<string, unknown>;
  result: unknown;
};

export type AgentResponse = {
  answer: string;
  tokens_used: number;
  latency_ms: number;
  steps: AgentStep[];
};

export const PRESETS = [
  "What is the average age of customers in Mumbai?",
  "Top 5 cities by total purchase amount",
  "How many customers signed up in 2024?",
  "Average purchase amount for customers over 40 in Tokyo",
  "Which country has the most customers?",
  "Who is the youngest customer in New York?",
];
