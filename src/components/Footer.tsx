import { COPY } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="py-6 border-t border-line">
      <div className="flex justify-center items-center gap-5 font-mono text-sm text-dim flex-wrap">
        <span>&copy; {new Date().getFullYear()} Hershey Goldberger</span>

        <span className="opacity-30" aria-hidden="true">·</span>

        <a
          href={`mailto:${COPY.contact.email}`}
          className="text-dim hover:text-accent-lit transition-colors"
        >
          {COPY.contact.email}
        </a>

        <span className="opacity-30" aria-hidden="true">·</span>

        <a
          href={COPY.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-dim hover:text-accent-lit transition-colors"
        >
          LinkedIn
        </a>

        <span className="opacity-30" aria-hidden="true">·</span>

        <a
          href={COPY.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-dim hover:text-accent-lit transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
