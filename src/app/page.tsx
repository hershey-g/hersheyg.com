import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Terminal from "@/components/Terminal";
import TerminalCompact from "@/components/TerminalCompact";
import AnimatedHR from "@/components/AnimatedHR";
import Services from "@/components/Services";
import Proof from "@/components/Proof";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      <DotGrid />
      <CursorGlow />
      <ScrollProgress />
      <Nav />

      <main className="relative z-10">
        <Hero />

        <div className="mx-auto max-w-6xl px-6">
          <Terminal />
          <TerminalCompact />
        </div>

        <AnimatedHR />
        <Services />
        <AnimatedHR />
        <Proof />
        <AnimatedHR />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
