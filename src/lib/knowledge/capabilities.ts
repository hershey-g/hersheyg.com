import type { KnowledgeEntry } from "./types";

export const CAPABILITIES_ENTRIES: KnowledgeEntry[] = [
  {
    id: "capability-ai-agents",
    category: "capabilities",
    keywords: ["agent", "ai", "chatbot", "whatsapp", "slack", "telegram", "voice", "bot", "automation"],
    techLevel: "any",
    content:
      "Hershey builds AI agents that work on WhatsApp, Slack, Telegram, and voice. These aren't chatbot demos. They book appointments, answer customer questions, close orders, and handle real edge cases in production.",
  },
  {
    id: "capability-ai-systems",
    category: "capabilities",
    keywords: ["llm", "rag", "orchestration", "autonomous", "workflow", "pipeline", "data"],
    techLevel: "technical",
    content:
      "On the AI systems side, Hershey builds LLM orchestration pipelines, RAG systems, and autonomous workflows. Systems that read data, make decisions, and take action, with human-in-the-loop when the stakes are high. Not chatbot wrappers.",
  },
  {
    id: "capability-fullstack",
    category: "capabilities",
    keywords: ["website", "web app", "app", "full-stack", "fullstack", "product", "build", "platform", "saas"],
    techLevel: "non-technical",
    content:
      "Hershey builds complete web applications and platforms from the ground up. One engineer handling everything from the database to the user interface to deployment. He's built products that handle thousands of users and millions in transactions.",
  },
];
