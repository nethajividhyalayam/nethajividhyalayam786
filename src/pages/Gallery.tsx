import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop", alt: "Classroom learning", category: "Academics" },
  { id: 2, src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop", alt: "Sports day", category: "Sports" },
  { id: 3, src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop", alt: "Library", category: "Facilities" },
  { id: 4, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop", alt: "Cultural event", category: "Events" },
  { id: 5, src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop", alt: "Science lab", category: "Academics" },
  { id: 6, src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop", alt: "Art class", category: "Activities" },
  { id: 7, src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop", alt: "School bus", category: "Transport" },
  { id: 8, src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop", alt: "Reading corner", category: "Library" },
  { id: 9, src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop", alt: "Annual day", category: "Events" },
  { id: 10, src: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&h=600&fit=crop", alt: "Computer lab", category: "Facilities" },
  { id: 11, src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop", alt: "Outdoor activities", category: "Sports" },
  { id: 12, src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop", alt: "Teacher interaction", category: "Academics" },
];

const categories = ["All", ...Array.from(new Set(galleryImages.map((img) => img.category)))];

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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${selectedCategory === cat ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry-like Grid with animations */}
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
