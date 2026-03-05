import { COPY } from "@/lib/constants";
import SectionTag from "./SectionTag";
import SectionHead from "./SectionHead";
import RevealOnScroll from "./RevealOnScroll";
import ServiceCard from "./ServiceCard";

export default function Services() {
  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTag>{COPY.services.tag}</SectionTag>
        <div className="mt-4">
          <SectionHead dim={COPY.services.headingDim}>
            {COPY.services.heading}
          </SectionHead>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {COPY.services.items.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 0.1}>
              <ServiceCard
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
