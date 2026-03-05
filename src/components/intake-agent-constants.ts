// intake-agent-constants.ts
// Agent copy, flow config, and types for the intake agent contact section

export interface AgentStep {
  id: string;
  agentMsg: string | null;
  options?: string[];
  type?: "input" | "textarea";
  placeholder?: string;
}

export interface AgentResponses {
  [stepId: string]: Record<string, string>;
}

export const AGENT_RESPONSES: AgentResponses = {
  type: {
    "AI agent":
      "Good news: Hershey has shipped more agents than he's had hot dinners. Telegram, WhatsApp, Slack, voice, you name it.",
    "Autonomous workflow":
      "The kind that actually does the work instead of reminding you to do the work. Hershey's favorite thing to build.",
    "Full-stack product":
      "Database to deploy, one person, zero meetings about meetings. That's the pitch.",
    "Not sure yet":
      "Totally fine. That's what the conversation is for. Hershey's good at turning vague ideas into working systems.",
  },
  timeline: {
    Yesterday:
      'Classic. Hershey operates well under "oh no" deadlines. He\'ll prioritize what ships first.',
    "This quarter":
      "Solid. Enough time to do it right, not so much time that scope creep shows up uninvited.",
    "Next quarter":
      "A planner. Hershey respects that. Gives him time to architect it properly instead of duct-taping it.",
    "Kicking tires":
      'Zero pressure. Sometimes the best projects start as a "hey, is this even possible?" conversation.',
  },
  budget: {
    "$10-25k":
      "That gets a focused, well-scoped build. No filler, just the thing that matters.",
    "$25-50k":
      "Now we're talking. Room for proper infrastructure, not just the happy path.",
    "$50k+":
      "Big ambitions require big architecture. Hershey's eyes just lit up somewhere.",
    TBD: "Totally fair. Hard to budget something that doesn't exist yet. Hershey will scope it and give you real numbers.",
  },
};

export const STEPS: AgentStep[] = [
  {
    id: "type",
    agentMsg:
      "Hey. I'm the intake agent. Think of me as the bouncer, except I let everyone in and just ask a few questions first.\n\nWhat are you looking to build?",
    options: ["AI agent", "Autonomous workflow", "Full-stack product", "Not sure yet"],
  },
  {
    id: "describe",
    agentMsg:
      "Give me the napkin sketch version. A sentence or two about what this thing actually needs to do.",
    type: "textarea",
    placeholder:
      "e.g. A WhatsApp bot that triages support tickets and only bugs a human when it's confused...",
  },
  {
    id: "timeline",
    agentMsg: "How soon does this need to exist in the world?",
    options: ["Yesterday", "This quarter", "Next quarter", "Kicking tires"],
  },
  {
    id: "budget",
    agentMsg:
      "Ballpark budget? This helps Hershey figure out if he's building a bicycle or a spaceship.",
    options: ["$10-25k", "$25-50k", "$50k+", "TBD"],
  },
  {
    id: "name",
    agentMsg: "Almost there. Two more and you're free. What's your name?",
    type: "input",
    placeholder: "Your name",
  },
  {
    id: "contact",
    agentMsg: null, // dynamic, built at runtime
    type: "input",
    placeholder: "email or phone",
  },
];
