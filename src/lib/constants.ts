export const COPY = {
  name: "Hershey Goldberger",
  role: "Full-Stack Engineer",
  headline: "I build things for the web.",
  subline:
    "Full-stack engineer focused on clean code, sharp interfaces, and products that just work.",
  nav: {
    services: "Services",
    proof: "Proof",
    contact: "Contact",
  },
  services: {
    tag: "01 // Services",
    heading: "What I do",
    headingDim: "and do well",
    items: [
      {
        title: "Frontend Development",
        description:
          "Responsive, performant interfaces built with React, Next.js, and modern CSS. Pixel-perfect execution from design to deployment.",
        icon: "layout",
      },
      {
        title: "Backend Engineering",
        description:
          "APIs, databases, and server infrastructure. Node.js, PostgreSQL, and cloud services that scale with your product.",
        icon: "server",
      },
      {
        title: "Full-Stack Products",
        description:
          "End-to-end product development from architecture to launch. I own the entire stack so nothing falls through the cracks.",
        icon: "layers",
      },
      {
        title: "Technical Consulting",
        description:
          "Architecture reviews, performance audits, and technical strategy. Honest assessments and actionable recommendations.",
        icon: "terminal",
      },
    ],
  },
  proof: {
    tag: "02 // Proof of Work",
    heading: "By the numbers",
    headingDim: "not just words",
    metrics: [
      { value: 8, suffix: "+", label: "Years of experience" },
      { value: 50, suffix: "+", label: "Projects shipped" },
      { value: 99, suffix: "%", label: "Client satisfaction" },
      { value: 24, suffix: "h", label: "Average response time" },
    ],
  },
  contact: {
    tag: "03 // Contact",
    heading: "Let's build",
    headingDim: "something great",
    body: "Have a project in mind? I'm always open to discussing new opportunities and interesting ideas.",
    cta: "Get in touch",
    email: "hello@hersheyg.com",
  },
  footer: {
    copyright: "Hershey Goldberger",
    tagline: "Built with Next.js, Tailwind, and attention to detail.",
  },
} as const;

export const TERMINAL_LINES = [
  { prompt: "whoami", output: "hershey" },
  { prompt: "cat skills.txt", output: "React, Next.js, TypeScript, Node.js, PostgreSQL, Tailwind" },
  { prompt: "uptime", output: "8+ years and counting" },
  { prompt: "echo $STATUS", output: "Available for new projects" },
  { prompt: "curl -s api.github.com/users/hersheyg | jq .bio", output: '"Building things that matter"' },
] as const;
