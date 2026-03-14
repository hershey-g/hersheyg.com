import type { KnowledgeEntry } from "./types";

const MAX_RESULTS = 4;
const CONTEXT_MESSAGES = 3; // last N messages to scan (per spec)

/**
 * Score a knowledge entry against a text string.
 * Returns the count of unique keyword matches (case-insensitive, whole-word).
 */
export function scoreEntry(entry: KnowledgeEntry, text: string): number {
  const lowerText = ` ${text.toLowerCase()} `;
  let hits = 0;
  for (const keyword of entry.keywords) {
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lowerText)) {
      hits++;
    }
  }
  return hits;
}

/**
 * Get relevant knowledge entries for the current conversation.
 * Scans the last few messages, matches against knowledge entries,
 * filters by techLevel, and returns the top entries as a formatted string.
 */
export function getRelevantKnowledge(
  messages: { role: string; content: string }[],
  visitorType: "technical" | "non-technical",
  entries: KnowledgeEntry[]
): string {
  // Take last N messages for context
  const recentMessages = messages.slice(-CONTEXT_MESSAGES);
  const contextText = recentMessages.map((m) => m.content).join(" ");

  // Filter by techLevel
  const eligible = entries.filter((e) => {
    if (e.techLevel === "any") return true;
    return e.techLevel === visitorType;
  });

  // Score and sort
  const scored = eligible
    .map((entry) => ({ entry, score: scoreEntry(entry, contextText) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  if (scored.length === 0) return "";

  return scored.map(({ entry }) => `- ${entry.content}`).join("\n\n");
}
