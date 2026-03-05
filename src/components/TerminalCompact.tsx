import { COPY } from "@/lib/constants";

export default function TerminalCompact() {
  return (
    <div
      className="flex items-center gap-2 font-mono text-xs border border-line rounded-sm px-4 py-2.5 bg-bg-2/50"
      aria-hidden="true"
    >
      <span
        className="inline-block h-2 w-2 rounded-full bg-[#22c55e]"
        style={{ animation: "blink 2s ease infinite" }}
      />
      <span className="text-dim">{COPY.terminalCompact}</span>
    </div>
  );
}
