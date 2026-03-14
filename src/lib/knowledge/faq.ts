import type { KnowledgeEntry } from "./types";

export const FAQ_ENTRIES: KnowledgeEntry[] = [
  {
    id: "faq-why-solo",
    category: "faq",
    keywords: ["team", "solo", "alone", "one person", "agency", "why"],
    techLevel: "any",
    content:
      "Hershey works solo by choice. One engineer means one person who understands every layer of the system, from database to deploy. No hand-offs, no lost context, no meetings about meetings. It's not a limitation, it's a feature.",
  },
  {
    id: "faq-availability",
    category: "faq",
    keywords: ["available", "availability", "start", "when", "capacity", "open", "free"],
    techLevel: "any",
    content:
      "Hershey takes on a limited number of projects at a time to give each one proper attention. Best to have a conversation about timing. He'll be straight with you about availability.",
  },
];
