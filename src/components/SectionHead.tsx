interface SectionHeadProps {
  children: string;
  dim: string;
}

export default function SectionHead({ children, dim }: SectionHeadProps) {
  return (
    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
      {children} <span className="text-text-dim">{dim}</span>
    </h2>
  );
}
