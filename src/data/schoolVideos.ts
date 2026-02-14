export interface SchoolVideo {
  title: string;
  url: string;
  category?: string;
  thumbnail?: string;
}

// All videos are locally hosted in public/videos/
export const schoolVideos: SchoolVideo[] = [
  { title: "School Campus Tour", url: "/videos/campus-tour.mp4", category: "Campus", thumbnail: "/videos/thumbnails/campus-tour.jpg" },
  { title: "Annual Day Celebrations", url: "/videos/annual-day.mp4", category: "Events", thumbnail: "/videos/thumbnails/annual-day.jpg" },
  { title: "Sports Day Highlights", url: "/videos/sports-day.mp4", category: "Sports", thumbnail: "/videos/thumbnails/sports-day.jpg" },
  { title: "Science Exhibition", url: "/videos/science-exhibition.mp4", category: "Academics", thumbnail: "/videos/thumbnails/science-exhibition.jpg" },
  { title: "Cultural Program", url: "/videos/cultural-program.mp4", category: "Events", thumbnail: "/videos/thumbnails/cultural-program.jpg" },
  { title: "Classroom Activities", url: "/videos/classroom-activities.mp4", category: "Academics", thumbnail: "/videos/thumbnails/classroom-activities.jpg" },
];

// Hero section shows all videos; filter with .filter(v => v.showInHero) if needed
export const heroVideos = schoolVideos;
