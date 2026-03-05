export default function Footer() {
  return (
    <footer className="py-8 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-dim">
          &copy; {new Date().getFullYear()} Hershey Goldberger
        </p>
        <p className="font-mono text-xs text-dim">
          Built by hand. Shipped to production.
        </p>
      </div>
    </footer>
  );
}
