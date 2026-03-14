export const COPY = {
  hero: {
    eyebrow: 'Independent AI Engineering',
    headline: 'I build AI that runs\nyour business forward',
    sub: 'Production-grade agents and automation — from prototype to live system. One engineer, zero overhead.',
    cta: 'Start a conversation',
  },
  services: {
    tag: 'What I Build',
    heading: ['Three things I do.', 'All of them well.'],
    qualifyingIntro: 'I work with founders and operators who need production systems — not prototypes.',
    cards: [
      {
        num: '01',
        title: 'Customers get answers. You don\'t lift a finger.',
        body: 'AI agents that book appointments, answer questions, and close orders — on WhatsApp, Slack, Telegram, or voice. Your business runs where your customers already are.',
      },
      {
        num: '02',
        title: 'Your data makes decisions. Not just dashboards.',
        body: 'Systems that read your data, make decisions, and take action — with a human check when the stakes are high. Not another chatbot. Real autonomous workflows.',
      },
      {
        num: '03',
        title: 'One engineer. Database to deploy.',
        body: 'Full-stack products architected by someone who\'s held the pager at 3am. Production-grade from day one.',
      },
    ],
  },
  proof: {
    tag: 'Proof of Work',
    heading: ['Numbers.', 'Not narrative.'],
    cards: [
      {
        metric: '180,000+',
        label: 'Ticketing Platform',
        body: 'Built a custom ticketing platform from scratch. 90k+ attendees at a single venue. Multi-venue deployments including MetLife Stadium and Wells Fargo Center. ~$9.2M in transaction volume. Architected for failure modes, not just the happy path.',
        badge: 'Production · Zero Downtime',
      },
      {
        metric: 'OpenClaw',
        label: 'Open Source',
        body: 'When a client hits a wall with vendor tools, I don\'t wait for support. I read the source, write the fix, and push it upstream. Merged PRs in voice/telephony infrastructure.',
        badge: 'Merged PRs · Core Infra',
      },
    ],
  },
  about: {
    tag: 'About',
    heading: ['One engineer.', 'The whole stack.'],
    body: [
      'I\'ve spent the last decade building software that runs under pressure — ticketing platforms processing thousands of concurrent users, AI agents handling real customer conversations, full-stack products that ship to production on day one.',
      'I work alone by choice, not by limitation. One engineer means one person who understands every layer of your system — from the database schema to the deploy pipeline. No hand-offs, no lost context, no meetings about meetings.',
    ],
  },
  contact: {
    tag: 'Contact',
    heading: 'Got a system that needs building?',
    sub: 'No pitch decks required. Just tell me what you need built.',
    pricing: 'I take on 2–3 projects at a time. Engagements are monthly retainer or project-based.',
    email: 'hello@hersheyg.com',
  },
  testimonials: [
    {
      text: 'Hershey built our entire ticketing infrastructure. 180,000+ attendees, zero downtime. He doesn\'t just write code — he owns the system.',
      attribution: '— Director of Operations, MetLife Stadium Events',
    },
    {
      text: 'We needed an AI agent that actually worked in production, not another demo. Hershey delivered a system that handles real customers, real edge cases, every day.',
      attribution: '— Founder, Verozza Lighting',
    },
    {
      text: 'Most engineers hand you a prototype and wish you luck. Hershey handed us a production system and stayed until it was bulletproof.',
      attribution: '— CTO, Speed Ticketing',
    },
  ],
  social: {
    linkedin: 'https://www.linkedin.com/in/hersheyg',
    github: 'https://github.com/hersheyg',
  },
} as const;
