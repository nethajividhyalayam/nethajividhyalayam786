import { useState, useCallback, useEffect, useMemo } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { schoolVideos, type SchoolVideo } from "@/data/schoolVideos";

const VideoGallery = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showPlayer, setShowPlayer] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(schoolVideos.map((v) => v.category || "Other"));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredVideos = useMemo(
    () => activeCategory === "All" ? schoolVideos : schoolVideos.filter((v) => v.category === activeCategory),
    [activeCategory]
  );

  const nextVideo = useCallback(
    () => setCurrentVideo((prev) => (prev + 1) % filteredVideos.length),
    [filteredVideos.length]
  );
  const prevVideo = () => setCurrentVideo((prev) => (prev - 1 + filteredVideos.length) % filteredVideos.length);

  const isYouTube = (url: string) => url.includes("youtube.com") || url.includes("youtu.be");

  // Auto-advance via YouTube postMessage API
  useEffect(() => {
    if (!isAutoPlay || !showPlayer) return;
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.event === "onStateChange" && data.info === 0) nextVideo();
      } catch { /* ignore */ }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAutoPlay, showPlayer, nextVideo]);

  // For non-YouTube videos, listen for ended event
  const handleVideoEnded = () => {
    if (isAutoPlay) nextVideo();
  };

  const openPlayer = (idx: number) => {
    setCurrentVideo(idx);
    setShowPlayer(true);
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/embed\/([^?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : "/placeholder.svg";
  };

  return (
    <Layout>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-primary text-white py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Video Gallery</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Explore our school life through {schoolVideos.length}+ videos — campus tours, events, academics & more.
          </p>
        </section>

        {/* Category Filter */}
        <div className="container-custom py-6 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => { setActiveCategory(cat); setCurrentVideo(0); }}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="container-custom pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video, idx) => (
            <button
              key={idx}
              onClick={() => openPlayer(idx)}
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-card text-left"
            >
              <div className="aspect-video relative">
                <img
                  src={isYouTube(video.url) ? getYouTubeThumbnail(video.url) : "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-accent-foreground fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-foreground text-sm line-clamp-1">{video.title}</h3>
                {video.category && (
                  <span className="text-xs text-muted-foreground">{video.category}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Play All Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-3 px-4 flex items-center justify-between z-50 shadow-lg">
          <span className="text-sm font-medium">{filteredVideos.length} Videos</span>
          <Button
            onClick={() => { setCurrentVideo(0); setIsAutoPlay(true); setShowPlayer(true); }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Play className="h-4 w-4 mr-2 fill-current" /> Play All Continuously
          </Button>
        </div>
      </main>

      {/* Fullscreen Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-fade-up">
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors ${
                isAutoPlay ? "bg-accent text-accent-foreground" : "bg-white/10 text-white/80 hover:text-white"
              }`}
            >
              {isAutoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isAutoPlay ? "Auto-play ON" : "Auto-play OFF"}
            </button>
            <button
              onClick={() => setShowPlayer(false)}
              className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 backdrop-blur-sm"
              aria-label="Close player"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-white font-serif text-xl md:text-2xl font-bold mb-4">
            {filteredVideos[currentVideo]?.title}
          </h2>

          <div className="relative w-full max-w-5xl aspect-video mx-4">
            {isYouTube(filteredVideos[currentVideo]?.url) ? (
              <iframe
                key={currentVideo}
                src={`${filteredVideos[currentVideo].url}?autoplay=1&rel=0&enablejsapi=1&origin=${window.location.origin}`}
                title={filteredVideos[currentVideo].title}
                className="w-full h-full rounded-xl shadow-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={currentVideo}
                src={filteredVideos[currentVideo].url}
                className="w-full h-full rounded-xl shadow-2xl"
                autoPlay
                controls
                onEnded={handleVideoEnded}
              />
            )}

            <button
              onClick={prevVideo}
              className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextVideo}
              className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <p className="text-white/70 text-sm mt-3">
            {currentVideo + 1} / {filteredVideos.length}
          </p>

          {/* Thumbnail strip */}
          <div className="flex gap-2 mt-4 px-4 overflow-x-auto max-w-full pb-2">
            {filteredVideos.map((video, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentVideo(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  idx === currentVideo
                    ? "bg-accent text-accent-foreground scale-105"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {video.title}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mt-4 md:hidden">
            <button onClick={prevVideo} className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-accent">← Previous</button>
            <button onClick={nextVideo} className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-accent">Next →</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VideoGallery;
