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
          <div className="mt-4">
            <SectionHead bold={COPY.proof.heading[0]} dim={COPY.proof.heading[1]} />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {COPY.proof.cards.map((card, i) => (
            <RevealOnScroll key={i} delay={i * 0.12}>
              <ProofCard card={card} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
