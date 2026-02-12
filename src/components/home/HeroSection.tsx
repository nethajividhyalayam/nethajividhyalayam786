import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import { Link } from "react-router-dom";


const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${String(year + 1).slice(-2)}`;
};

const HeroSection = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/placeholder.svg"
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/60 to-primary/80" />
      </div>

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

          {/* Video Play Button (Optional) */}
          <div className="pt-8">
            <button 
              className="group inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              aria-label="Watch school tour video"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent transition-colors">
                <Play className="h-6 w-6 fill-current" />
              </div>
              <span className="text-sm font-medium">Watch Our School Tour</span>
            </button>
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
