export interface SchoolVideo {
  title: string;
  url: string;
  category?: string;
}

// Add your school videos here. Both YouTube embed URLs and direct video file URLs are supported.
// For uploaded videos, place them in public/videos/ and use the path like "/videos/my-video.mp4"
export const schoolVideos: SchoolVideo[] = [
  { title: "School Campus Tour", url: "https://www.youtube.com/embed/V1bFr2SWP1I", category: "Campus" },
  { title: "Annual Day Celebrations", url: "https://www.youtube.com/embed/LXb3EKWsInQ", category: "Events" },
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
