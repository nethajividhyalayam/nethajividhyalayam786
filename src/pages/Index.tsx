import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import QuickLinksSection from "@/components/home/QuickLinksSection";
import AboutSection from "@/components/home/AboutSection";
import LeadershipSection from "@/components/home/LeadershipSection";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import EventsSection from "@/components/home/EventsSection";
import GallerySection from "@/components/home/GallerySection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <QuickLinksSection />
      <AboutSection />
      <LeadershipSection />
      <FacilitiesSection />
      <EventsSection />
      <GallerySection />
      <CTASection />
    </Layout>
  );
};

export default Index;
