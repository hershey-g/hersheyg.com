export type { KnowledgeEntry } from "./types";
export { classifyVisitor } from "./classifier";
export { getRelevantKnowledge } from "./matcher";

import { PORTFOLIO_ENTRIES } from "./portfolio";
import { OPINIONS_ENTRIES } from "./opinions";
import { PROCESS_ENTRIES } from "./process";
import { CAPABILITIES_ENTRIES } from "./capabilities";
import { FAQ_ENTRIES } from "./faq";
import type { KnowledgeEntry } from "./types";

export const ALL_KNOWLEDGE: KnowledgeEntry[] = [
  ...PORTFOLIO_ENTRIES,
  ...OPINIONS_ENTRIES,
  ...PROCESS_ENTRIES,
  ...CAPABILITIES_ENTRIES,
  ...FAQ_ENTRIES,
];
