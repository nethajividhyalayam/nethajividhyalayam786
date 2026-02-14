export interface SchoolVideo {
  title: string;
  url: string;
  category?: string;
  thumbnail?: string;
}

// All videos are locally hosted in public/videos/
export const schoolVideos: SchoolVideo[] = [
  {
    title: "School Campus Tour",
    url: "/videos/campus-tour.mp4",
    category: "Campus",
    thumbnail: "/videos/thumbnails/campus-tour.jpg",
  },
  {
    title: "Annual Day Celebrations",
    url: "/videos/annual-day.mp4",
    category: "Events",
    thumbnail: "/videos/thumbnails/annual-day.jpg",
  },
  {
    title: "Sports Day Highlights",
    url: "/videos/sports-day.mp4",
    category: "Sports",
    thumbnail: "/videos/thumbnails/sports-day.jpg",
  },
  {
    title: "Science Exhibition",
    url: "/videos/science-exhibition.mp4",
    category: "Academics",
    thumbnail: "/videos/thumbnails/science-exhibition.jpg",
  },
  {
    title: "Cultural Program",
    url: "/videos/cultural-program.mp4",
    category: "Events",
    thumbnail: "/videos/thumbnails/cultural-program.jpg",
  },
  {
    title: "Classroom Activities",
    url: "/videos/classroom-activities.mp4",
    category: "Academics",
    thumbnail: "/videos/thumbnails/classroom-activities.jpg",
  },
  // @ts-ignore{ title: "School Campus Tour", url: "https://www.youtube.com/embed/V1bFr2SWP1I", category: "Campus" },
  // @ts-ignore{ title: "Annual Day Celebrations", url: "https://www.youtube.com/embed/LXb3EKWsInQ", category: "Events" },
  // @ts-ignore{ title: "Sports Day Highlights", url: "https://www.youtube.com/embed/2lAe1cqCOXo", category: "Sports" },
  // @ts-ignore{ title: "Science Exhibition", url: "https://www.youtube.com/embed/GD0x33mENRg", category: "Academics" },
  // @ts-ignore{ title: "Cultural Program", url: "https://www.youtube.com/embed/RK1K2bCg4J8", category: "Events" },
  // @ts-ignore{ title: "Classroom Activities", url: "https://www.youtube.com/embed/WmVLcj-XKnM", category: "Academics" },
  // @ts-ignore{ title: "Library & Labs", url: "https://www.youtube.com/embed/daSRTfnp3Qo", category: "Campus" },
  // @ts-ignore{ title: "Parent-Teacher Meet", url: "https://www.youtube.com/embed/Sagg08DrO5U", category: "Events" },
  // @ts-ignore{ title: "Republic Day Parade", url: "https://www.youtube.com/embed/6ZfuNTqbHE8", category: "Events" },
  // @ts-ignore{ title: "Graduation Ceremony", url: "https://www.youtube.com/embed/9bZkp7q19f0", category: "Events" },
];

// Hero section shows all videos; filter with .filter(v => v.showInHero) if needed
export const heroVideos = schoolVideos;
