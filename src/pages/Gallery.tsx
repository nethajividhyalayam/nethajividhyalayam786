import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { X, ChevronLeft, ChevronRight, ZoomIn, Info } from "lucide-react";
import { galleryImages, galleryCategories } from "@/data/galleryData";

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const filtered = galleryImages.filter(
    (img) => selectedCategory === "All" || img.category === selectedCategory
  );

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
  };

  // Featured image is always the first in the filtered list
  const featured = filtered[0];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Nethaji Vidyalayam School Gallery
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            A glimpse into the vibrant life at Nethaji Vidhyalayam, from academic achievements to cultural celebrations.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground shadow-md scale-105"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Image Card */}
          {featured && (
            <div
              className="mb-12 bg-card rounded-2xl shadow-lg overflow-hidden cursor-pointer group border border-border"
              onClick={() => openLightbox(0)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Featured Image */}
                <div className="md:w-2/3 relative overflow-hidden">
                  <img
                    src={featured.src}
                    alt={featured.alt}
                    className="w-full h-64 md:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  {/* Zoom overlay on hover */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-all duration-500 flex items-center justify-center">
                    <ZoomIn className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                {/* Featured Info */}
                <div className="md:w-1/3 p-6 md:p-8 flex flex-col justify-center">
                  <span className="inline-block bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-4">
                    {featured.category}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {featured.alt}
                  </h2>
                  {featured.description && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Info className="h-5 w-5 mt-0.5 shrink-0 text-accent" />
                      <p className="text-sm leading-relaxed">{featured.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image Grid — 4 columns like reference */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl cursor-pointer bg-card border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-all duration-500 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100" />
                  </div>
                  {/* Category badge - top right */}
                  <span className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.category}
                  </span>
                </div>
                {/* Title below image */}
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground truncate">{image.alt}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{image.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox with zoom effect */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImage((p) => (p - 1 + filtered.length) % filtered.length);
            }}
            className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="max-w-5xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[currentImage]?.src}
              alt={filtered[currentImage]?.alt}
              className="w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="text-center mt-4 space-y-2">
              <span className="bg-accent/90 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                {filtered[currentImage]?.category} — {filtered[currentImage]?.alt}
              </span>
              {filtered[currentImage]?.description && (
                <p className="text-white/70 text-sm max-w-xl mx-auto mt-3">
                  {filtered[currentImage]?.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImage((p) => (p + 1) % filtered.length);
            }}
            className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(i);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentImage ? "bg-accent w-6" : "bg-white/50"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
