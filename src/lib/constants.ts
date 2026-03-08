export interface HeroVariant {
  headline: string;
  sub: string;
}

export const HERO_VARIANTS: HeroVariant[] = [
  {
    headline: 'Your AI\nshouldn\'t need\na babysitter.',
    sub: 'I architect autonomous systems that replace workflows, not assist them. When something breaks, I fix it at the source. One engineer. Full ownership. No layers.',
  },
  {
    headline: 'Ship the agent.\nNot the org chart.',
    sub: 'You don\'t need a team of twelve to build production AI. You need one engineer who owns the system end to end. That\'s the offer.',
  },
  {
    headline: 'Workflows that\nrun themselves.\nSeriously.',
    sub: 'I build AI that handles the job — not just the easy parts. Agents, automations, full-stack products. Architect to deploy, one person.',
  },
  {
    headline: 'Most AI demos\nbreak in prod.\nMine don\'t.',
    sub: 'I build for the 3am edge case, not the investor demo. Production-grade agents and systems. One engineer. No hand-off. No surprises.',
  },
  {
    headline: 'One engineer.\nFull stack.\nNo meetings.',
    sub: 'From architecture to deployment, I build the whole thing. AI agents, autonomous workflows, production products. You talk to the person writing the code.',
  },
  {
    headline: 'Built to run.\nNot to demo.',
    sub: 'Every system I ship is designed for real load, real users, real failure modes. No staging-only magic. One engineer, full ownership, production-first.',
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
    ghost: 'See the work',
  },
  nav: {
    services: 'services',
    proof: 'proof',
    contact: 'contact',
  },
  services: {
    tag: '01 // Services',
    heading: ['What gets built.', 'What gets shipped.'],
    cards: [
      {
        num: '01',
        title: 'AI Agents on WhatsApp & Beyond',
        body: 'Your business, available on WhatsApp. I build AI agents that book appointments, answer questions, and handle orders — right where your customers already chat. Also deploys to Slack, Telegram, and voice.',
        tags: ['WhatsApp Business API', 'Twilio', 'Slack', 'Telegram', 'Voice'],
      },
      {
        num: '02',
        title: 'Custom AI Systems',
        body: 'AI that does the work, not just the thinking. I build systems that read your data, make decisions, and take action — with a human check when the stakes are high.',
        tags: ['LLM Orchestration', 'RAG', 'Agents', 'Python', 'TypeScript'],
      },
      {
        num: '03',
        title: 'Full-Stack Products',
        body: 'Database to deploy. Architected by someone who\'s held the pager at 3am.',
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
        body: 'Built a custom ticketing platform from scratch. ~$9M in transaction volume. Multi-venue deployments across major arenas. Architected for failure modes, not just the happy path.',
        badge: 'Production \u00b7 Zero Downtime',
      },
      {
        metric: 'OpenClaw',
        headerLabel: 'Open Source',
        statusDot: 'static',
        scrambleDelay: 200,
        label: 'Open Source Contributor',
        body: 'When a client hits a wall, I read the source, write the fix, and push it upstream. Merged PRs in voice/telephony infrastructure and core platform.',
        badge: 'Merged PRs \u00b7 Core Infra',
      },
    ],
  },
  contact: {
    tag: '03 // Contact',
    heading: 'Got a system that needs building?',
    sub: 'I take on a limited number of projects at a time. No pitch decks required. Just tell me what you need built.',
    email: 'hello@hersheyg.com',
    aside: 'Remote-first.\nBest fit: teams shipping production AI.',
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/hersheyg',
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
