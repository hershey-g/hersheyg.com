export interface HeroVariant {
  headline: string;
  sub: string;        // desktop version (full paragraph)
  mobileSub: string;  // mobile version (1 short line)
}

export const HERO_VARIANTS: HeroVariant[] = [
  {
    headline: 'Your AI\nshouldn\'t need\na babysitter.',
    sub: 'I architect autonomous systems that replace workflows, not assist them. When something breaks, I fix it at the source. One engineer. Full ownership. No layers.',
    mobileSub: 'Autonomous systems that replace workflows. One engineer. Full ownership.',
  },
  {
    headline: 'Ship the agent.\nNot the org chart.',
    sub: 'You don\'t need a team of twelve to build production AI. You need one engineer who owns the system end to end. That\'s the offer.',
    mobileSub: 'One engineer. End-to-end production AI. No org chart needed.',
  },
  {
    headline: 'Workflows that\nrun themselves.\nSeriously.',
    sub: 'I build AI that handles the job — not just the easy parts. Agents, automations, full-stack products. Architect to deploy, one person.',
    mobileSub: 'AI that does the job. Agents to deploy, one person.',
  },
  {
    headline: 'Most AI demos\nbreak in prod.\nMine don\'t.',
    sub: 'I build for the 3am edge case, not the investor demo. Production-grade agents and systems. One engineer. No hand-off. No surprises.',
    mobileSub: 'Built for the 3am edge case. Production-grade, no surprises.',
  },
  {
    headline: 'One engineer.\nFull stack.\nNo meetings.',
    sub: 'From architecture to deployment, I build the whole thing. AI agents, autonomous workflows, production products. You talk to the person writing the code.',
    mobileSub: 'Architecture to deployment. You talk to the person writing the code.',
  },
  {
    headline: 'Built to run.\nNot to demo.',
    sub: 'Every system I ship is designed for real load, real users, real failure modes. No staging-only magic. One engineer, full ownership, production-first.',
    mobileSub: 'Real load, real users. One engineer, full ownership.',
  },
];

export const COPY = {
  meta: {
    title: 'Hershey Goldberger',
    description: 'Agentic AI systems and full-stack products. Production-grade. One engineer.',
  },
  hero: {
    eyebrow: 'Building agentic AI that runs in production',
    cta: 'Start a conversation',
  },
  nav: {
    services: 'services',
    proof: 'proof',
    about: 'about',
    contact: 'contact',
  },
  services: {
    tag: '01 // Services',
    heading: ['What gets built.', 'What gets shipped.'],
    qualifyingIntro: 'I work with founders and operators who need production systems — not prototypes.',
    statsBar: '180k+ tickets sold · $9.2M in transactions · zero downtime',
    cards: [
      {
        num: '01',
        title: 'Customers get answers. You don\'t lift a finger.',
        body: 'AI agents that book appointments, answer questions, and close orders — on WhatsApp, Slack, Telegram, or voice. Your business runs where your customers already are.',
        tags: ['WhatsApp Business API', 'Twilio', 'Slack', 'Telegram', 'Voice'],
      },
      {
        num: '02',
        title: 'Your data makes decisions. Not just dashboards.',
        body: 'Systems that read your data, make decisions, and take action — with a human check when the stakes are high. Not another chatbot. Real autonomous workflows.',
        tags: ['LLM Orchestration', 'RAG', 'Agents', 'Python', 'TypeScript'],
      },
      {
        num: '03',
        title: 'One engineer. Database to deploy.',
        body: 'Full-stack products architected by someone who\'s held the pager at 3am. Production-grade from day one.',
        tags: ['Next.js', 'React', 'Node', 'Laravel', 'Postgres', 'Vercel'],
      },
    ],
  },
  proof: {
    tag: '02 // Proof of Work',
    heading: ['Numbers.', 'Not narrative.'],
    cards: [
      {
        metric: '180,000+',
        headerLabel: 'Ticketing Platform',
        statusDot: 'pulse',
        scrambleDelay: 0,
        label: 'Attendees Processed',
        body: 'Built a custom ticketing platform from scratch. 90k+ attendees at a single venue. Multi-venue deployments including MetLife Stadium and Wells Fargo Center. ~$9.2M in transaction volume. Architected for failure modes, not just the happy path.',
        badge: 'Production \u00b7 Zero Downtime',
      },
      {
        metric: 'OpenClaw',
        headerLabel: 'Open Source',
        statusDot: 'static',
        scrambleDelay: 200,
        label: 'Open Source Contributor',
        body: 'When a client hits a wall with vendor tools, I don\'t wait for support. I read the source, write the fix, and push it upstream. Merged PRs in voice/telephony infrastructure.',
        badge: 'Merged PRs \u00b7 Core Infra',
      },
    ],
  },
  about: {
    tag: '03 // About',
    heading: ['One engineer.', 'The whole stack.'],
    body: [
      'I\'ve spent the last decade building software that runs under pressure — ticketing platforms processing thousands of concurrent users, AI agents handling real customer conversations, full-stack products that ship to production on day one.',
      'I work alone by choice, not by limitation. One engineer means one person who understands every layer of your system — from the database schema to the deploy pipeline. No hand-offs, no lost context, no meetings about meetings.',
    ],
  },
  contact: {
    tag: '04 // Contact',
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
  footer: {
    left: 'Hershey Goldberger',
  },
  terminal: {
    title: '~/projects',
    lines: [
      { type: 'cmd', text: '$ deploy --agent ticketing-v3' },
      { type: 'comment', text: '# multi-venue \u00b7 180k+ attendees' },
      { type: 'kv', key: 'transactions', value: '$9.2M', color: 'orange' },
      { type: 'kv', key: 'downtime', value: '0', color: 'green' },
      { type: 'kv', key: 'status', value: '\u25cf Live in production', color: 'green' },
      { type: 'blank' },
      { type: 'cmd', text: '$ git log --oneline openclaw' },
      { type: 'out', text: '  a3f29c1 feat: twilio call-waiting' },
      { type: 'out', text: '  e7b14d8 fix: core infra telephony' },
      { type: 'success', text: '  \u2713 merged to main' },
      { type: 'blank' },
      { type: 'cursor' },
    ],
  },
  terminalCompact: '\u25cf Live in production \u00b7 180k+ processed \u00b7 $9.2M volume',
} as const;
