import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${String(year + 1).slice(-2)}`;
};

const HeroSection = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>Admissions Open for {getAcademicYear()}</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            Welcome to{" "}
            <span className="text-accent">Nethaji Vidhyalayam</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
            Empowering young minds with quality education, distinctive character building, and holistic development for a brighter tomorrow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/about">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-6 text-lg"
              >
                Read More
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/admissions#apply">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-6 text-lg"
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/80 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
