const TECHNICAL_SIGNALS: string[] = [
  // Frameworks & libraries
  "react", "next\\.js", "nextjs", "vue", "angular", "svelte", "django",
  "flask", "rails", "laravel", "express", "fastapi", "spring",
  // Infrastructure
  "api", "graphql", "rest", "grpc", "microservices", "docker",
  "kubernetes", "k8s", "aws", "gcp", "azure", "vercel", "ci/cd",
  "terraform", "nginx",
  // Programming terms
  "endpoint", "middleware", "schema", "migration", "deploy", "webhook",
  "cron", "database", "postgres", "mongodb", "redis", "sql",
  "typescript", "python", "node", "backend", "frontend",
  "repository", "git", "branch", "pipeline", "serverless",
  "websocket", "oauth", "jwt", "sdk", "orm",
];

// Build a single regex that matches any signal as a whole word (case-insensitive)
const SIGNAL_PATTERN = new RegExp(
  `\\b(?:${TECHNICAL_SIGNALS.join("|")})\\b`,
  "gi"
);

const TECHNICAL_THRESHOLD = 3;

export function classifyVisitor(
  messages: { role: string; content: string }[]
): "technical" | "non-technical" {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const matches = userText.match(SIGNAL_PATTERN);
  // Count unique signals (case-insensitive)
  const uniqueSignals = new Set(
    (matches ?? []).map((m) => m.toLowerCase())
  );

  return uniqueSignals.size >= TECHNICAL_THRESHOLD
    ? "technical"
    : "non-technical";
}
