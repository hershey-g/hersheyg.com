import type { KnowledgeEntry } from "./types";

export const OPINIONS_ENTRIES: KnowledgeEntry[] = [
  {
    id: "opinion-nextjs",
    category: "opinions",
    keywords: ["next", "nextjs", "react", "framework", "frontend", "ssr", "server components"],
    techLevel: "technical",
    content:
      "Hershey's go-to for web apps is Next.js with the App Router. Server components mean less client-side JavaScript and better performance out of the box. He prefers it over standalone React SPAs because you get routing, SSR, and API routes without bolting on extra tooling.",
  },
  {
    id: "opinion-simple-stack",
    category: "opinions",
    keywords: ["stack", "technology", "tools", "simple", "postgres", "database"],
    techLevel: "any",
    content:
      "Hershey keeps his stack simple on purpose. TypeScript, Next.js, Postgres, Vercel. He'd rather master fewer tools than juggle a dozen. Simpler stacks mean fewer things that can break at 3am.",
  },
];
