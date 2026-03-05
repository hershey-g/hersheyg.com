import { COPY } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} {COPY.footer.copyright}
        </p>
        <p className="text-sm text-text-muted">{COPY.footer.tagline}</p>
      </div>
    </footer>
  );
}
