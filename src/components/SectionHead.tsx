interface SectionHeadProps {
  bold: string;
  dim: string;
}

export default function SectionHead({ bold, dim }: SectionHeadProps) {
  return (
    <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] tracking-tight">
      <span className="text-white font-bold">{bold}</span>{" "}
      <span className="text-dim font-normal">{dim}</span>
    </h2>
  );
}
