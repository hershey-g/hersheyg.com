export interface KnowledgeEntry {
  id: string;
  category: "portfolio" | "opinions" | "process" | "capabilities" | "faq";
  keywords: string[];
  techLevel: "any" | "technical" | "non-technical";
  content: string;
}
