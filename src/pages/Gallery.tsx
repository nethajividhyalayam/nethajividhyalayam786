import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { galleryImages, galleryCategories } from "@/data/galleryData";

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const filtered = selectedCategory === "All" ? galleryImages : galleryImages.filter((img) => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-lg text-primary-foreground/80">Capturing moments of joy, learning, and achievement</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${selectedCategory === cat ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry-like Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid group relative overflow-hidden rounded-xl cursor-pointer animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                  <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-accent transition-colors z-10" aria-label="Close">
            <X className="h-8 w-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p - 1 + filtered.length) % filtered.length); }} className="absolute left-4 text-white hover:text-accent transition-colors" aria-label="Previous">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <img
            src={filtered[currentImage]?.src}
            alt={filtered[currentImage]?.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <button onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p + 1) % filtered.length); }} className="absolute right-4 text-white hover:text-accent transition-colors" aria-label="Next">
            <ChevronRight className="h-8 w-8" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {filtered.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? "bg-accent" : "bg-white/50"}`} aria-label={`Image ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
