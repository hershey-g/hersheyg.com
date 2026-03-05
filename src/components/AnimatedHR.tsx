export default function AnimatedHR() {
  return (
    <div
      className="relative h-px w-full bg-border overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        style={{ animation: "streak 3s linear infinite" }}
      />
    </div>
  );
}
