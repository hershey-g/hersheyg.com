export default function AnimatedHR() {
  return (
    <div
      className="relative h-px w-full overflow-hidden"
      style={{ backgroundColor: "rgba(148, 163, 184, 0.08)" }}
      aria-hidden="true"
    >
      <div
        className="absolute h-full w-[120px] bg-gradient-to-r from-transparent via-accent-lit to-transparent"
        style={{ animation: "streak 6s linear infinite" }}
      />
    </div>
  );
}
