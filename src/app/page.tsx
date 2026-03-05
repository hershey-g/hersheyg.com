import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
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
