import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import ProofCard from "./ProofCard";

export default function Proof() {
  return (
    <section id="proof" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll>
          <SectionTag>{COPY.proof.tag}</SectionTag>
          <SectionHead dim={COPY.proof.headingDim}>
            {COPY.proof.heading}
          </SectionHead>
        </RevealOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {COPY.proof.metrics.map((metric, i) => (
            <RevealOnScroll key={metric.label} delay={i * 0.1}>
              <ProofCard
                value={metric.value}
                suffix={metric.suffix}
                label={metric.label}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
