export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
}

/**
 * School Photo Gallery Data
 * 
 * To add new photos:
 * 1. Place image files in public/photos/<category-folder>/
 * 2. Add an entry below with the path: /photos/<category-folder>/filename.jpg
 * 
 * Supported categories:
 * Academics, Sports, Facilities, Events, Activities,
 * Annual Sports Day 2024, Teachers' Day Celebration,
 * Yoga & Wellness Day, Career Guidance Workshop,
 * Science Exhibition, Cultural Festival, Parent-Teacher Meeting,
 * School Annual Picnic, Art & Craft Exhibition,
 * Leadership & Guidance, Memories & Moments
 */

export const galleryImages: GalleryImage[] = [
  // ── Academics ──
  { id: 1, src: "/photos/academics/classroom-1.jpg", alt: "Classroom learning session", category: "Academics" },
  { id: 2, src: "/photos/academics/science-lab.jpg", alt: "Science lab experiments", category: "Academics" },
  { id: 3, src: "/photos/academics/library-reading.jpg", alt: "Students in the library", category: "Academics" },

  // ── Sports ──
  { id: 4, src: "/photos/sports/sports-day-1.jpg", alt: "Sports day activities", category: "Sports" },
  { id: 5, src: "/photos/sports/cricket-match.jpg", alt: "Cricket match", category: "Sports" },
  { id: 6, src: "/photos/sports/outdoor-games.jpg", alt: "Outdoor games", category: "Sports" },

  // ── Facilities ──
  { id: 7, src: "/photos/facilities/school-building.jpg", alt: "School building", category: "Facilities" },
  { id: 8, src: "/photos/facilities/computer-lab.jpg", alt: "Computer lab", category: "Facilities" },
  { id: 9, src: "/photos/facilities/playground.jpg", alt: "School playground", category: "Facilities" },

  // ── Events ──
  { id: 10, src: "/photos/events/annual-day.jpg", alt: "Annual day celebration", category: "Events" },
  { id: 11, src: "/photos/events/independence-day.jpg", alt: "Independence Day", category: "Events" },
  { id: 12, src: "/photos/events/republic-day.jpg", alt: "Republic Day celebration", category: "Events" },

  // ── Activities ──
  { id: 13, src: "/photos/activities/dance-performance.jpg", alt: "Dance performance", category: "Activities" },
  { id: 14, src: "/photos/activities/music-class.jpg", alt: "Music class", category: "Activities" },
  { id: 15, src: "/photos/activities/drawing-competition.jpg", alt: "Drawing competition", category: "Activities" },

  // ── Annual Sports Day 2024 ──
  { id: 16, src: "/photos/annual-sports-day/opening-ceremony.jpg", alt: "Opening ceremony", category: "Annual Sports Day 2024" },
  { id: 17, src: "/photos/annual-sports-day/relay-race.jpg", alt: "Relay race", category: "Annual Sports Day 2024" },
  { id: 18, src: "/photos/annual-sports-day/prize-distribution.jpg", alt: "Prize distribution", category: "Annual Sports Day 2024" },

  // ── Teachers' Day Celebration ──
  { id: 19, src: "/photos/teachers-day/celebration-1.jpg", alt: "Teachers' Day celebration", category: "Teachers' Day Celebration" },
  { id: 20, src: "/photos/teachers-day/felicitation.jpg", alt: "Teacher felicitation", category: "Teachers' Day Celebration" },

  // ── Yoga & Wellness Day ──
  { id: 21, src: "/photos/yoga-wellness/yoga-session.jpg", alt: "Yoga session", category: "Yoga & Wellness Day" },
  { id: 22, src: "/photos/yoga-wellness/meditation.jpg", alt: "Meditation session", category: "Yoga & Wellness Day" },

  // ── Career Guidance Workshop ──
  { id: 23, src: "/photos/career-guidance/workshop-1.jpg", alt: "Career guidance session", category: "Career Guidance Workshop" },
  { id: 24, src: "/photos/career-guidance/guest-speaker.jpg", alt: "Guest speaker session", category: "Career Guidance Workshop" },

  // ── Science Exhibition ──
  { id: 25, src: "/photos/science-exhibition/project-display.jpg", alt: "Science project display", category: "Science Exhibition" },
  { id: 26, src: "/photos/science-exhibition/experiments.jpg", alt: "Student experiments", category: "Science Exhibition" },

  // ── Cultural Festival ──
  { id: 27, src: "/photos/cultural-festival/stage-performance.jpg", alt: "Stage performance", category: "Cultural Festival" },
  { id: 28, src: "/photos/cultural-festival/traditional-dance.jpg", alt: "Traditional dance", category: "Cultural Festival" },

  // ── Parent-Teacher Meeting ──
  { id: 29, src: "/photos/parent-teacher/meeting-1.jpg", alt: "Parent-teacher meeting", category: "Parent-Teacher Meeting" },
  { id: 30, src: "/photos/parent-teacher/discussion.jpg", alt: "Parent-teacher discussion", category: "Parent-Teacher Meeting" },

  // ── School Annual Picnic ──
  { id: 31, src: "/photos/school-picnic/group-photo.jpg", alt: "Picnic group photo", category: "School Annual Picnic" },
  { id: 32, src: "/photos/school-picnic/fun-activities.jpg", alt: "Picnic fun activities", category: "School Annual Picnic" },

  // ── Art & Craft Exhibition ──
  { id: 33, src: "/photos/art-craft/artwork-display.jpg", alt: "Student artwork display", category: "Art & Craft Exhibition" },
  { id: 34, src: "/photos/art-craft/craft-making.jpg", alt: "Craft making session", category: "Art & Craft Exhibition" },

  // ── Leadership & Guidance ──
  { id: 35, src: "/photos/leadership/principal.jpg", alt: "Principal", category: "Leadership & Guidance" },
  { id: 36, src: "/photos/leadership/vice-principal.jpg", alt: "Vice Principal", category: "Leadership & Guidance" },
  { id: 37, src: "/photos/leadership/chairman.jpg", alt: "Chairman", category: "Leadership & Guidance" },

  // ── Memories & Moments ──
  { id: 38, src: "/photos/memories/school-life-1.jpg", alt: "School life moments", category: "Memories & Moments" },
  { id: 39, src: "/photos/memories/graduation.jpg", alt: "Graduation ceremony", category: "Memories & Moments" },
  { id: 40, src: "/photos/memories/assembly.jpg", alt: "Morning assembly", category: "Memories & Moments" },
];

/** All unique categories derived from the gallery data */
export const galleryCategories = ["All", ...Array.from(new Set(galleryImages.map((img) => img.category)))];

/** Get a subset of images for the homepage preview (first 6) */
export const getHomepageGallery = (count = 6) => galleryImages.slice(0, count);
