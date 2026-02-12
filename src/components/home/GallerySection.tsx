import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { getHomepageGallery } from "@/data/galleryData";

const GallerySection = () => {
  const galleryImages = getHomepageGallery(6);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <p className="text-accent font-medium mb-2 uppercase tracking-wider text-sm">Memories & Moments</p>
            <h2 className="section-title">Photo Gallery</h2>
          </div>
          <Link to="/gallery">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                <ZoomIn className="h-8 w-8 text-white mb-2" />
                <span className="bg-accent px-3 py-1 rounded-full text-sm text-accent-foreground font-medium">
                  {image.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10" aria-label="Close lightbox">
            <X className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p - 1 + galleryImages.length) % galleryImages.length); }} className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors" aria-label="Previous image">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="max-w-5xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[currentImage].src}
              alt={galleryImages[currentImage].alt}
              className="w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="text-center mt-4">
              <span className="bg-accent/90 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                {galleryImages[currentImage].category} — {galleryImages[currentImage].alt}
              </span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p + 1) % galleryImages.length); }} className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors" aria-label="Next image">
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, index) => (
              <button key={index} onClick={(e) => { e.stopPropagation(); setCurrentImage(index); }} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentImage ? "bg-accent w-6" : "bg-white/50"}`} aria-label={`Go to image ${index + 1}`} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
