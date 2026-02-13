export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  description?: string;
}

export const galleryImages: GalleryImage[] = [
  // ── School Annual Picnic ──
  {
    id: 1,
    src: "/photos/school-picnic/group-photo.jpg",
    alt: "School Annual Picnic",
    category: "Events",
    description: "Students enjoyed a joyful and refreshing school picnic filled with games, sightseeing, and bonding activities that strengthened friendships and created lasting memories.",
  },
  // ── Annual Day ──
  {
    id: 2,
    src: "/photos/events/annual-day.jpg",
    alt: "Annual Day Celebration 2024",
    category: "Events",
    description: "A spectacular annual day with cultural performances, prize distribution, and memorable moments celebrating student achievements throughout the year.",
  },
  // ── Sports Day ──
  {
    id: 3,
    src: "/photos/sports/sports-day-1.jpg",
    alt: "Sports Day Highlights",
    category: "Sports",
    description: "An exciting sports day filled with relay races, track events, and athletic competitions showcasing the sporting talents of our students.",
  },
  // ── Cultural Festival ──
  {
    id: 4,
    src: "/photos/cultural-festival/stage-performance.jpg",
    alt: "Cultural Fest Program",
    category: "Events",
    description: "A vibrant cultural festival featuring traditional dance performances, music, drama, and artistic showcases by talented students.",
  },
  // ── Science Exhibition ──
  {
    id: 5,
    src: "/photos/science-exhibition/project-display.jpg",
    alt: "Science Exhibition",
    category: "Campus",
    description: "Students presented innovative science projects and working models, demonstrating creativity and scientific thinking at the annual science exhibition.",
  },
  // ── Teachers' Day ──
  {
    id: 6,
    src: "/photos/teachers-day/celebration-1.jpg",
    alt: "Teachers' Day Celebration",
    category: "Events",
    description: "A heartfelt celebration honoring our dedicated teachers with flowers, gifts, and cultural programs organized by grateful students.",
  },
  // ── Art & Craft ──
  {
    id: 7,
    src: "/photos/art-craft/artwork-display.jpg",
    alt: "Art & Craft Exhibition",
    category: "Events",
    description: "A colorful exhibition showcasing student artwork, paintings, drawings, and creative crafts displayed across the school corridors.",
  },
  // ── Independence Day ──
  {
    id: 8,
    src: "/photos/events/independence-day.jpg",
    alt: "Independence Day Celebration",
    category: "Events",
    description: "A patriotic celebration with flag hoisting, cultural programs, and inspiring speeches commemorating India's independence.",
  },
  // ── Classroom Activities ──
  {
    id: 9,
    src: "/photos/academics/classroom-1.jpg",
    alt: "Classroom Activities & Learning",
    category: "Campus",
    description: "Engaging classroom sessions where students actively participate in learning, experiments, and interactive educational activities.",
  },
];

/** All unique categories derived from the gallery data */
export const galleryCategories = [
  "All",
  ...Array.from(new Set(galleryImages.map((img) => img.category))),
];

/** Get a subset of images for the homepage preview */
export const getHomepageGallery = (count = 6) => galleryImages.slice(0, count);
