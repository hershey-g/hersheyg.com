import { COPY } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="py-6 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-mono text-[11px] text-dim">
        {/* Copyright */}
        <span>&copy; {new Date().getFullYear()} Hershey Goldberger</span>

        <span className="text-dim/30 hidden sm:inline" aria-hidden="true">·</span>

        {/* Social links */}
        <div className="flex items-center gap-3">
          <a
            href={COPY.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dim hover:text-accent-lit transition-colors"
          >
            LinkedIn →
          </a>
          <a
            href={COPY.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dim hover:text-accent-lit transition-colors"
          >
            GitHub →
          </a>
        </div>

        <span className="text-dim/30 hidden sm:inline" aria-hidden="true">·</span>

        {/* Agent credit */}
        <span className="text-dim/50">designed &amp; shipped by an AI agent</span>
      </div>
    </footer>
  );
}
