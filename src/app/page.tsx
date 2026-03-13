import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Proof from "@/components/Proof";
import About from "@/components/About";
import IntakeAgent from "@/components/IntakeAgent";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import FloatingCTA from "@/components/FloatingCTA";

export default function Home() {
  return (
    <>
      <DotGrid />
      <CursorGlow />
      <ScrollProgress />
      <Nav />

      <main className="relative z-10">
        <Hero />
        <Services />
        <Proof />
        <About />
        <IntakeAgent />
      </main>

      <Footer />
      <FloatingCTA />
    </>
  );
}
