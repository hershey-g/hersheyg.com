import type { KnowledgeEntry } from "./types";

export const PORTFOLIO_ENTRIES: KnowledgeEntry[] = [
  {
    id: "project-ticketing-platform",
    category: "portfolio",
    keywords: ["ticketing", "events", "stadium", "attendees", "transactions", "scale", "high-traffic"],
    techLevel: "any",
    content:
      "Hershey built a custom ticketing platform from scratch that processed 180,000+ attendees across venues including MetLife Stadium and Wells Fargo Center. About $9.2M in transaction volume. Zero downtime. He architected it for failure modes, not just the happy path.",
  },
  {
    id: "project-openclaw",
    category: "portfolio",
    keywords: ["open source", "voice", "telephony", "openclaw", "contributions", "PR"],
    techLevel: "technical",
    content:
      "Hershey contributes to OpenClaw, an open source voice/telephony project. When a client hits a wall with vendor tools, he reads the source, writes the fix, and pushes it upstream. Merged PRs in core voice infrastructure.",
  },
];
