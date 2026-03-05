"use client";

import CountUp from "./CountUp";

interface ProofCardProps {
  value: number;
  suffix: string;
  label: string;
}

export default function ProofCard({ value, suffix, label }: ProofCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 text-center">
      <div className="text-4xl font-bold text-accent">
        <CountUp end={value} suffix={suffix} />
      </div>
      <p className="text-sm text-text-dim mt-2">{label}</p>
    </div>
  );
}
