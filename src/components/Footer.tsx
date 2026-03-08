import { COPY } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="py-6 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-4 font-mono text-[11px] text-dim">
        {/* Copyright + LinkedIn */}
        <div className="flex items-center gap-2.5">
          <span>&copy; {new Date().getFullYear()} Hershey Goldberger</span>
          <a
            href={COPY.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-dim hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        <span className="text-dim/30" aria-hidden="true">·</span>

        {/* Agent credit */}
        <span className="text-dim/50">designed &amp; shipped by an AI agent</span>
      </div>
    </footer>
  );
}
