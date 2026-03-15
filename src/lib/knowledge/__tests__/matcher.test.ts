import { describe, it, expect } from "vitest";
import { getRelevantKnowledge, scoreEntry } from "../matcher";
import type { KnowledgeEntry } from "../types";

const TEST_ENTRIES: KnowledgeEntry[] = [
  {
    id: "test-ai",
    category: "capabilities",
    keywords: ["ai", "agent", "chatbot"],
    techLevel: "any",
    content: "We build AI agents.",
  },
  {
    id: "test-react",
    category: "opinions",
    keywords: ["react", "nextjs", "frontend"],
    techLevel: "technical",
    content: "We prefer Next.js for frontend.",
  },
  {
    id: "test-app",
    category: "capabilities",
    keywords: ["app", "website", "platform"],
    techLevel: "non-technical",
    content: "We build web apps and platforms.",
  },
  {
    id: "test-pricing",
    category: "process",
    keywords: ["pricing", "cost", "retainer"],
    techLevel: "any",
    content: "Engagements are retainer or project-based.",
  },
];

describe("scoreEntry", () => {
  it("scores by unique keyword hits", () => {
    const score = scoreEntry(TEST_ENTRIES[0], "I want an AI agent chatbot");
    expect(score).toBe(3); // ai, agent, chatbot
  });

  it("returns 0 for no matches", () => {
    const score = scoreEntry(TEST_ENTRIES[0], "I need a website");
    expect(score).toBe(0);
  });

  it("is case-insensitive", () => {
    const score = scoreEntry(TEST_ENTRIES[0], "I want an AI AGENT");
    expect(score).toBe(2);
  });

  it("matches whole words only", () => {
    const score = scoreEntry(TEST_ENTRIES[3], "I need repricing analysis");
    expect(score).toBe(0); // "repricing" should NOT match "pricing"
  });

  it("matches hyphenated keywords like full-stack", () => {
    const entry: KnowledgeEntry = {
      id: "test-hyphen",
      category: "capabilities",
      keywords: ["full-stack", "high-traffic"],
      techLevel: "any",
      content: "test",
    };
    expect(scoreEntry(entry, "I need a full-stack developer")).toBe(1);
    expect(scoreEntry(entry, "We handle high-traffic sites")).toBe(1);
  });

  it("matches multi-word keywords like open source", () => {
    const entry: KnowledgeEntry = {
      id: "test-multi",
      category: "portfolio",
      keywords: ["open source", "one person"],
      techLevel: "any",
      content: "test",
    };
    expect(scoreEntry(entry, "Do you contribute to open source?")).toBe(1);
    expect(scoreEntry(entry, "Is it just one person?")).toBe(1);
  });
});

describe("getRelevantKnowledge", () => {
  it("returns empty string when no messages match", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "hello" }],
      "non-technical",
      TEST_ENTRIES
    );
    expect(result).toBe("");
  });

  it("returns matching entries formatted as text", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "I want to build an AI agent" }],
      "non-technical",
      TEST_ENTRIES
    );
    expect(result).toContain("We build AI agents.");
    // Should NOT include technical-only entry
    expect(result).not.toContain("We prefer Next.js");
  });

  it("includes technical entries for technical visitors", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "I need a React frontend with nextjs" }],
      "technical",
      TEST_ENTRIES
    );
    expect(result).toContain("We prefer Next.js");
  });

  it("filters out non-technical entries for technical visitors", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "I need a website app platform" }],
      "technical",
      TEST_ENTRIES
    );
    // non-technical entry should be excluded for technical visitors
    expect(result).not.toContain("We build web apps and platforms.");
  });

  it("caps at 4 entries", () => {
    // Create 6 entries that all match
    const manyEntries: KnowledgeEntry[] = Array.from({ length: 6 }, (_, i) => ({
      id: `test-${i}`,
      category: "faq" as const,
      keywords: ["test"],
      techLevel: "any" as const,
      content: `Entry ${i} content.`,
    }));
    const result = getRelevantKnowledge(
      [{ role: "user", content: "test" }],
      "non-technical",
      manyEntries
    );
    const entryCount = (result.match(/Entry \d content\./g) ?? []).length;
    expect(entryCount).toBeLessThanOrEqual(4);
  });

  it("uses last 3 messages for context", () => {
    const messages = [
      { role: "user", content: "some old message about unrelated things" },
      { role: "user", content: "another old message" },
      { role: "user", content: "more old stuff" },
      { role: "assistant", content: "assistant reply" },
      { role: "user", content: "I want an AI agent" },
    ];
    const result = getRelevantKnowledge(messages, "non-technical", TEST_ENTRIES);
    expect(result).toContain("We build AI agents.");
  });
});
