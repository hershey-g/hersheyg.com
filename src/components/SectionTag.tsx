interface SectionTagProps {
  children: string;
}

export default function SectionTag({ children }: SectionTagProps) {
  return (
    <span className="font-mono text-xs tracking-widest uppercase text-accent-lit block">
      {children}
    </span>
  );
}
