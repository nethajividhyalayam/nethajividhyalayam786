import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2, Play, RotateCcw, Star, ChevronRight, Home, MessageCircle, BookOpen, Sparkles, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────
const GRADES = ["LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

const TOPICS: Record<string, { emoji: string; color: string; items: string[] }> = {
  Greetings: {
    emoji: "👋",
    color: "from-green-400 to-emerald-500",
    items: ["Hello! How are you?", "Good morning!", "Good afternoon!", "Goodbye! See you tomorrow.", "Nice to meet you.", "Thank you very much.", "You are welcome.", "Please and thank you.", "Excuse me, may I come in?", "Have a great day!"],
  },
  Animals: {
    emoji: "🐘",
    color: "from-yellow-400 to-orange-500",
    items: ["The cat sat on the mat.", "The dog barks loudly.", "The elephant is very big.", "The rabbit hops quickly.", "The bird sings a sweet song.", "The fish swims in water.", "The cow gives us milk.", "The hen lays eggs every day.", "The lion is the king of the jungle.", "The butterfly is very colorful."],
  },
  Rhymes: {
    emoji: "🎵",
    color: "from-purple-400 to-pink-500",
    items: ["Twinkle twinkle little star, how I wonder what you are.", "Baa baa black sheep, have you any wool?", "Humpty Dumpty sat on a wall.", "Jack and Jill went up the hill.", "Mary had a little lamb.", "Old MacDonald had a farm.", "The wheels on the bus go round and round.", "Rain rain go away, come again another day.", "Hickory dickory dock, the mouse ran up the clock.", "Row row row your boat."],
  },
  "Simple Sentences": {
    emoji: "📝",
    color: "from-blue-400 to-cyan-500",
    items: ["I go to school every day.", "My name is …", "I like to read books.", "Today is a sunny day.", "I eat rice and vegetables for lunch.", "My mother is very kind.", "The sky is blue and the grass is green.", "I brush my teeth every morning.", "Please open the window.", "The flowers are very beautiful."],
  },
  Pronunciation: {
    emoji: "🗣️",
    color: "from-red-400 to-rose-500",
    items: ["Think about the thing.", "This is the third Thursday.", "She sells seashells.", "Peter Piper picked a peck.", "The thirty-three thieves.", "Whether the weather is warm.", "Red lorry yellow lorry.", "Fresh French fried fish.", "How much wood would a woodchuck chuck?", "The sixth sick sheik's sixth sheep is sick."],
  },
  Colours: {
    emoji: "🌈",
    color: "from-teal-400 to-green-500",
    items: ["The sky is blue.", "Roses are red, violets are blue.", "The sun is yellow and bright.", "Grass is green and fresh.", "An orange is orange in colour.", "Purple grapes are sweet.", "The pink flamingo is beautiful.", "White clouds float in the sky.", "Black ants work very hard.", "Brown soil helps plants grow."],
  },
  Numbers: {
    emoji: "🔢",
    color: "from-indigo-400 to-purple-500",
    items: ["One two three four five, once I caught a fish alive.", "Six seven eight nine ten, then I let it go again.", "Count from one to ten.", "I have two hands and ten fingers.", "There are seven days in a week.", "There are twelve months in a year.", "I am five years old.", "There are thirty students in my class.", "Two plus two equals four.", "The clock shows three o'clock."],
  },
  Conversation: {
    emoji: "💬",
    color: "from-pink-400 to-fuchsia-500",
    items: ["What is your name?", "How old are you?", "Where do you live?", "What is your favourite colour?", "Do you have any brothers or sisters?", "What do you like to eat?", "What is your favourite subject?", "Tell me about your best friend.", "What do you do after school?", "What is your favourite animal?"],
  },
};

const STAR_MESSAGES: Record<number, { text: string; emoji: string; color: string }> = {
  5: { text: "Amazing! Perfect!", emoji: "🏆", color: "text-yellow-500" },
  4: { text: "Very Good!", emoji: "🌟", color: "text-green-500" },
  3: { text: "Good Try!", emoji: "👍", color: "text-blue-500" },
  2: { text: "Keep Trying!", emoji: "💪", color: "text-orange-500" },
  1: { text: "Let's Try Again!", emoji: "🔄", color: "text-red-500" },
};

type Screen = "home" | "practice" | "conversation" | "result";

interface Feedback {
  stars: number;
  feedback: string;
  tamilFeedback?: string;
  improvement?: string;
  encouragement?: string;
  nextWord?: string;
}

interface ConvMessage { role: "ai" | "user"; text: string }

// ── Helpers ────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function tts(text: string, speed = 0.85): Promise<HTMLAudioElement | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ text, speed }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Audio(URL.createObjectURL(blob));
  } catch { return null; }
}

async function stt(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("audio", blob, "recording.webm");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-stt`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: fd,
  });
  if (!res.ok) throw new Error("STT failed");
  const data = await res.json();
  return data.text || "";
}

async function getFeedback(payload: object): Promise<Feedback> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/spoken-english-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Feedback failed");
  return res.json();
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StarRating({ stars, animate }: { stars: number; animate: boolean }) {
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-8 w-8 transition-all duration-500",
            s <= stars ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200",
            animate && s <= stars ? "animate-bounce" : ""
          )}
          style={{ animationDelay: `${(s - 1) * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function MicButton({ isRecording, onClick, disabled }: { isRecording: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none shadow-lg",
        isRecording
          ? "bg-red-500 shadow-red-300 scale-110"
          : "bg-gradient-to-br from-green-400 to-emerald-600 hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
      )}
      {isRecording ? (
        <MicOff className="h-10 w-10 text-white relative z-10" />
      ) : (
        <Mic className="h-10 w-10 text-white relative z-10" />
      )}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function SpokenEnglish() {
  const [screen, setScreen] = useState<Screen>("home");
  const [grade, setGrade] = useState("1st");
  const [topic, setTopic] = useState("Greetings");
  const [tamilMode, setTamilMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [spokenText, setSpokenText] = useState("");
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const [convMessages, setConvMessages] = useState<ConvMessage[]>([]);
  const [convStarted, setConvStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const convBottomRef = useRef<HTMLDivElement>(null);

  const topicData = TOPICS[topic];
  const currentSentence = topicData.items[currentIndex % topicData.items.length];

  // Auto-scroll conversation
  useEffect(() => {
    convBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string, speed = 0.85) => {
    stopAudio();
    setIsPlaying(true);
    const audio = await tts(text, speed);
    if (!audio) { setIsPlaying(false); return; }
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
  }, [stopAudio]);

  const startRecording = useCallback(async () => {
    try {
      stopAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.start();
      mediaRef.current = mr;
      setIsRecording(true);
    } catch {
      alert("Please allow microphone access to use this feature.");
    }
  }, [stopAudio]);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const mr = mediaRef.current;
      if (!mr) return resolve(new Blob());
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mr.stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      mr.stop();
      setIsRecording(false);
    });
  }, []);

  // Practice mode: record & analyze
  const handleMicToggle = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      const blob = await stopRecording();
      try {
        const spoken = await stt(blob);
        setSpokenText(spoken);
        const fb = await getFeedback({ targetText: currentSentence, spokenText: spoken, grade, topic, mode: "practice", tamilMode });
        setFeedback(fb);
        setSessionScore((prev) => [...prev, fb.stars]);
        setShowResult(true);
      } catch {
        setFeedback({ stars: 2, feedback: "Could not process your audio. Please try again!", encouragement: "Don't give up! 💪" });
        setShowResult(true);
      }
      setIsProcessing(false);
    } else {
      setFeedback(null);
      setShowResult(false);
      setSpokenText("");
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, currentSentence, grade, topic, tamilMode]);

  const nextSentence = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setFeedback(null);
    setSpokenText("");
    setShowResult(false);
  }, []);

  // Conversation mode
  const startConversation = useCallback(async () => {
    setConvStarted(true);
    const starters: Record<string, string> = {
      Greetings: "Hello! How are you today? I am Sparky, your English friend! What is your name?",
      Animals: "Hi there! Do you like animals? What is your favourite animal?",
      Conversation: "Hello! Let us talk in English. How was your day at school?",
      default: "Hello! Let us practice speaking English together. How are you?",
    };
    const aiText = starters[topic] || starters.default;
    setConvMessages([{ role: "ai", text: aiText }]);
    await speak(aiText, 0.8);
  }, [topic, speak]);

  const handleConvMic = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      const blob = await stopRecording();
      try {
        const spoken = await stt(blob);
        if (!spoken.trim()) { setIsProcessing(false); return; }
        setConvMessages((prev) => [...prev, { role: "user", text: spoken }]);
        const fb = await getFeedback({ spokenText: spoken, grade, topic, mode: "conversation", conversationHistory: convMessages, tamilMode });
        const aiReply = fb.nextWord || fb.feedback;
        setConvMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
        if (fb.improvement) setFeedback(fb);
        await speak(aiReply, 0.82);
      } catch {
        setConvMessages((prev) => [...prev, { role: "ai", text: "I did not catch that. Please try again!" }]);
      }
      setIsProcessing(false);
    } else {
      stopAudio();
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, grade, topic, convMessages, tamilMode, speak, stopAudio]);

  // ── Render: Home ───────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-6 text-white text-center shadow-lg">
          <div className="text-4xl mb-1">🗣️</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Spoken English</h1>
          <p className="text-green-100 text-sm mt-1">Practice App for Kids</p>
          <p className="text-xs text-green-200 mt-0.5 font-medium">Nethaji Vidhyalayam</p>
        </div>

        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
          {/* Grade Selector */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2 text-center">👤 Select Your Grade</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                    grade === g
                      ? "bg-green-500 border-green-500 text-white scale-105 shadow-md"
                      : "bg-white border-green-200 text-green-700 hover:border-green-400"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Picker */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2 text-center">📚 Choose a Topic</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TOPICS).map(([name, data]) => (
                <button
                  key={name}
                  onClick={() => setTopic(name)}
                  className={cn(
                    "p-3 rounded-2xl border-2 text-left transition-all font-semibold text-sm",
                    topic === name
                      ? `bg-gradient-to-br ${data.color} text-white border-transparent shadow-lg scale-105`
                      : "bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-sm"
                  )}
                >
                  <span className="text-xl">{data.emoji}</span>
                  <p className="mt-1 text-xs leading-tight">{name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tamil Mode Toggle */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-gray-700">Tamil Help Mode</p>
                <p className="text-xs text-gray-500">Get explanations in Tamil</p>
              </div>
            </div>
            <button
              onClick={() => setTamilMode(!tamilMode)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                tamilMode ? "bg-orange-500" : "bg-gray-300"
              )}
            >
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", tamilMode ? "left-6" : "left-0.5")} />
            </button>
          </div>

          {/* Mode Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => { setCurrentIndex(0); setFeedback(null); setSpokenText(""); setShowResult(false); setScreen("practice"); }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-extrabold text-lg">Practice Mode</p>
                  <p className="text-green-100 text-xs">Repeat words &amp; get feedback</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6" />
            </button>

            <button
              onClick={() => { setConvMessages([]); setConvStarted(false); setFeedback(null); setScreen("conversation"); }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-extrabold text-lg">Conversation Mode</p>
                  <p className="text-purple-100 text-xs">Chat with Sparky the AI!</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Session Score */}
          {sessionScore.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100">
              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4 text-yellow-500" /> Session Score</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {sessionScore.slice(-8).map((s, i) => (
                    <div key={i} className="flex flex-col justify-end h-8">
                      <div className={cn("w-4 rounded-t-sm", s >= 4 ? "bg-green-400" : s >= 3 ? "bg-yellow-400" : "bg-red-400")} style={{ height: `${(s / 5) * 100}%` }} />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-lg font-black text-gray-800">{(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length).toFixed(1)} ⭐</p>
                  <p className="text-xs text-gray-500">{sessionScore.length} rounds</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Practice ──────────────────────────────────────────────────
  if (screen === "practice") {
    const starInfo = feedback ? STAR_MESSAGES[feedback.stars] || STAR_MESSAGES[1] : null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-green-50 to-emerald-50 flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${topicData.color} px-4 py-4 text-white shadow-lg`}>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button onClick={() => { stopAudio(); setScreen("home"); }} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-extrabold text-lg">{topicData.emoji} {topic}</p>
              <p className="text-xs text-white/80">Grade {grade} • Practice Mode</p>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full flex flex-col gap-4">
          {/* Sentence Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100 text-center">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Say this sentence:</p>
            <p className="text-xl font-bold text-gray-800 leading-relaxed">{currentSentence}</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(currentSentence, 0.75)}
                disabled={isPlaying || isRecording}
                className="gap-1 text-green-700 border-green-200 hover:bg-green-50"
              >
                <Volume2 className="h-4 w-4" /> {isPlaying ? "Playing…" : "Listen"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(currentSentence, 0.6)}
                disabled={isPlaying || isRecording}
                className="gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <Play className="h-4 w-4" /> Slow
              </Button>
            </div>
          </div>

          {/* Mic Section */}
          <div className="flex flex-col items-center gap-3">
            <MicButton isRecording={isRecording} onClick={handleMicToggle} disabled={isProcessing} />
            <p className="text-sm font-semibold text-gray-600">
              {isProcessing ? "⏳ Analysing your speech…" : isRecording ? "🔴 Recording… tap to stop" : "Tap mic to speak"}
            </p>
          </div>

          {/* Spoken Text */}
          {spokenText && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-400 font-medium mb-1">You said:</p>
              <p className="text-gray-700 font-medium italic">"{spokenText}"</p>
            </div>
          )}

          {/* Feedback Card */}
          {showResult && feedback && (
            <div className="bg-white rounded-3xl p-5 shadow-md border border-yellow-100 animate-fade-in">
              <StarRating stars={feedback.stars} animate />
              {starInfo && (
                <p className={cn("text-center font-extrabold text-lg mt-2", starInfo.color)}>
                  {starInfo.emoji} {starInfo.text}
                </p>
              )}
              <p className="text-gray-700 text-sm text-center mt-3 leading-relaxed">{feedback.feedback}</p>
              {feedback.improvement && (
                <div className="mt-3 bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-600 font-bold">💡 Tip:</p>
                  <p className="text-xs text-orange-700 mt-0.5">{feedback.improvement}</p>
                </div>
              )}
              {tamilMode && feedback.tamilFeedback && (
                <div className="mt-3 bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-bold">🌺 Tamil Help:</p>
                  <p className="text-xs text-green-700 mt-0.5" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{feedback.tamilFeedback}</p>
                </div>
              )}
              {feedback.encouragement && (
                <p className="text-center text-sm font-bold text-purple-600 mt-3">{feedback.encouragement}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => { setFeedback(null); setSpokenText(""); setShowResult(false); }}
                >
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
                <Button
                  className="flex-1 gap-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={nextSentence}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex gap-1 justify-center flex-wrap">
            {topicData.items.map((_, i) => (
              <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === currentIndex % topicData.items.length ? "bg-green-500 w-4" : i < currentIndex ? "bg-green-300" : "bg-gray-200")} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Conversation ──────────────────────────────────────────────
  if (screen === "conversation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-4 text-white shadow-lg">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button onClick={() => { stopAudio(); setScreen("home"); }} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-extrabold text-lg">💬 Talk with Sparky</p>
              <p className="text-xs text-white/80">Grade {grade} • {topic}</p>
            </div>
            <div className="w-8" />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full space-y-3">
          {!convStarted && (
            <div className="text-center mt-8">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-lg font-bold text-gray-700">Hi! I'm Sparky!</p>
              <p className="text-gray-500 text-sm mb-6">Your friendly English conversation partner</p>
              <button
                onClick={startConversation}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-3 font-bold text-lg shadow-lg hover:scale-105 transition-transform"
              >
                Start Talking! 🎤
              </button>
            </div>
          )}

          {convMessages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "ai" && <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🤖</div>}
              <div className={cn("max-w-[78%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm", msg.role === "ai" ? "bg-white text-gray-800 rounded-tl-sm" : "bg-purple-500 text-white rounded-tr-sm")}>
                {msg.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm mr-2">🤖</div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={convBottomRef} />
        </div>

        {/* Pronunciation tip during conversation */}
        {feedback?.improvement && (
          <div className="mx-4 mb-2 max-w-md mx-auto">
            <div className="bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
              <p className="text-xs text-orange-600 font-bold">💡 {feedback.improvement}</p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        {convStarted && (
          <div className="pb-6 pt-2 flex flex-col items-center gap-2 max-w-md mx-auto w-full">
            <MicButton isRecording={isRecording} onClick={handleConvMic} disabled={isProcessing || isPlaying} />
            <p className="text-xs text-gray-500">
              {isPlaying ? "🔊 Sparky is speaking…" : isProcessing ? "⏳ Thinking…" : isRecording ? "🔴 Listening… tap to send" : "Tap to speak"}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
