interface SectionTagProps {
  children: string;
}

export default function SectionTag({ children }: SectionTagProps) {
  return (
    <span className="font-mono text-xs tracking-widest uppercase text-accent-lit max-lg:sticky max-lg:top-16 max-lg:z-10 max-lg:bg-bg/80 max-lg:backdrop-blur-lg max-lg:py-2 max-lg:block">
      {children}
    </span>
  );
}
