export interface DemoMessage {
  from: "visitor" | "agent";
  text: string;
}

export interface DemoScript {
  id: string;
  messages: DemoMessage[];
}

export const DEMO_SCRIPTS: DemoScript[] = [
  {
    id: "whatsapp-bot",
    messages: [
      {
        from: "visitor",
        text: "I need a WhatsApp bot that lets my clients book appointments.",
      },
      {
        from: "agent",
        text: "On it. What\u2019s the booking system \u2014 Calendly, Acuity, custom?",
      },
      {
        from: "visitor",
        text: "Acuity. Clients pick a service, then a time.",
      },
      {
        from: "agent",
        text: "Handled. I\u2019ll build the agent on WhatsApp Business API \u2014 reads services from Acuity, presents open slots, confirms the booking. Takes about 2 weeks.",
      },
    ],
  },
  {
    id: "internal-tool",
    messages: [
      {
        from: "visitor",
        text: "We have an Airtable that tracks client onboarding. Every time a status changes, someone has to post in Slack manually.",
      },
      {
        from: "agent",
        text: "Say no more. I\u2019ll wire Airtable webhooks to a small agent that posts formatted updates to the right Slack channel. Status change \u2192 instant notification.",
      },
      {
        from: "visitor",
        text: "Can it tag the account owner?",
      },
      {
        from: "agent",
        text: "Yep. It\u2019ll pull the owner from the Airtable record and @-mention them in the Slack message. Should be live in under a week.",
      },
    ],
  },
  {
    id: "voice-agent",
    messages: [
      {
        from: "visitor",
        text: "Our phone lines close at 6pm but we still get calls. Can AI handle after-hours?",
      },
      {
        from: "agent",
        text: "Absolutely. I\u2019ll deploy a voice agent on your line \u2014 takes calls, answers FAQs, books callbacks for anything it can\u2019t handle.",
      },
      {
        from: "visitor",
        text: "What if someone needs to reach a real person urgently?",
      },
      {
        from: "agent",
        text: "Built-in escalation. The agent detects urgency keywords, texts your on-call team, and patches through if someone\u2019s available.",
      },
    ],
  },
  {
    id: "ticketing",
    messages: [
      {
        from: "visitor",
        text: "We\u2019re running a 10,000-person event and need custom ticketing. Not Eventbrite \u2014 something we control.",
      },
      {
        from: "agent",
        text: "My wheelhouse. I\u2019ve built ticketing for 180k+ attendees across major arenas. What\u2019s the venue?",
      },
      {
        from: "visitor",
        text: "Convention center, multiple entry points, VIP and GA tiers.",
      },
      {
        from: "agent",
        text: "I\u2019ll build a full stack \u2014 tiered ticket purchase, QR check-in at each gate, real-time capacity dashboard. Designed for failure modes, not just the happy path.",
      },
    ],
  },
  {
    id: "ai-search",
    messages: [
      {
        from: "visitor",
        text: "Our support docs are a mess. Can you build an AI that actually finds the right answer?",
      },
      {
        from: "agent",
        text: "Classic RAG problem. I\u2019ll index your docs, build a search agent that returns precise answers with source links \u2014 not just keyword matches.",
      },
      {
        from: "visitor",
        text: "We have docs in Notion, Confluence, and a few random PDFs.",
      },
      {
        from: "agent",
        text: "No problem. I\u2019ll build connectors for all three, normalize the content, and keep the index fresh on a schedule.",
      },
    ],
  },
  {
    id: "saas-product",
    messages: [
      {
        from: "visitor",
        text: "I have a SaaS idea but no technical co-founder. Can you build the MVP?",
      },
      {
        from: "agent",
        text: "That\u2019s half my clients. What does the product do in one sentence?",
      },
      {
        from: "visitor",
        text: "It helps freelancers track time and auto-generate invoices.",
      },
      {
        from: "agent",
        text: "Clean scope. I\u2019ll build it in Next.js \u2014 time tracking UI, invoice templates, Stripe integration. Database to deploy, you own the code.",
      },
    ],
  },
];

export const DEMO_TIMING = {
  visitorDelay: 300,
  agentTypingShow: 800,
  agentDelay: 600,
  messageReveal: 150,
  pauseAfterScript: 2500,
};

export function createRotation<T>(items: T[]): () => T {
  let queue: T[] = [];
  return () => {
    if (queue.length === 0) {
      queue = [...items];
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }
    return queue.pop()!;
  };
}
