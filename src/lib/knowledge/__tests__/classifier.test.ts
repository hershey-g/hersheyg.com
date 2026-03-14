import { describe, it, expect } from "vitest";
import { classifyVisitor } from "../classifier";

describe("classifyVisitor", () => {
  it("returns non-technical for empty messages", () => {
    expect(classifyVisitor([])).toBe("non-technical");
  });

  it("returns non-technical for generic business language", () => {
    const messages = [
      { role: "user", content: "I need an app for my restaurant" },
      { role: "user", content: "Something that lets customers order online" },
    ];
    expect(classifyVisitor(messages)).toBe("non-technical");
  });

  it("returns technical when 3+ technical terms are used", () => {
    const messages = [
      { role: "user", content: "I need a Next.js app with a GraphQL API and Docker deployment" },
    ];
    expect(classifyVisitor(messages)).toBe("technical");
  });

  it("ignores assistant messages", () => {
    const messages = [
      { role: "assistant", content: "We use React and Next.js with GraphQL and Docker" },
      { role: "user", content: "Sounds good, I need a website" },
    ];
    expect(classifyVisitor(messages)).toBe("non-technical");
  });

  it("accumulates signals across multiple user messages", () => {
    const messages = [
      { role: "user", content: "I'm using React right now" },
      { role: "user", content: "We need a REST API" },
      { role: "user", content: "Deploying on Kubernetes" },
    ];
    expect(classifyVisitor(messages)).toBe("technical");
  });

  it("is case-insensitive", () => {
    const messages = [
      { role: "user", content: "We use REACT with GRAPHQL and need CI/CD" },
    ];
    expect(classifyVisitor(messages)).toBe("technical");
  });

  it("returns non-technical for borderline cases (fewer than 3 signals)", () => {
    const messages = [
      { role: "user", content: "I have a React app" },
    ];
    expect(classifyVisitor(messages)).toBe("non-technical");
  });
});
