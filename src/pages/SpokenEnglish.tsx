import { useState, useRef, useCallback, useEffect } from "react";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import {
  Mic, MicOff, Volume2, Play, RotateCcw, Star,
  ChevronRight, MessageCircle, BookOpen, Sparkles, Globe,
  ArrowLeft, User, Check, X as XIcon, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Voice profiles ─────────────────────────────────────────────────────────
const VOICE_OPTIONS = [
  { key: "laura",   label: "Laura",   desc: "Clear & Friendly",        gender: "female", emoji: "👩‍🏫" },
  { key: "jessica", label: "Jessica", desc: "Warm & Encouraging",      gender: "female", emoji: "👩‍🎓" },
  { key: "alice",   label: "Alice",   desc: "Bright & Cheerful",       gender: "female", emoji: "🧑‍🏫" },
  { key: "matilda", label: "Matilda", desc: "Gentle & Kind",           gender: "female", emoji: "👩" },
  { key: "liam",    label: "Liam",    desc: "Friendly Teacher",        gender: "male",   emoji: "👨‍🏫" },
  { key: "charlie", label: "Charlie", desc: "Calm & Clear",            gender: "male",   emoji: "🧑" },
  { key: "george",  label: "George",  desc: "Warm & Trustworthy",      gender: "male",   emoji: "👨‍🎓" },
] as const;

type VoiceKey = typeof VOICE_OPTIONS[number]["key"];

// Grade → base speed for TTS
const GRADE_SPEED: Record<string, number> = {
  LKG: 0.72, UKG: 0.75, "1st": 0.78, "2nd": 0.80,
  "3rd": 0.83, "4th": 0.86, "5th": 0.88,
};

// ── Curriculum ─────────────────────────────────────────────────────────────
const GRADES = ["LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

interface TopicData {
  emoji: string;
  color: string;
  curriculum: string;
  items: string[];
}

const TOPICS: Record<string, TopicData> = {
  "Greetings": {
    emoji: "👋", color: "from-green-400 to-emerald-500", curriculum: "Merry Birds • Oxford",
    items: [
      "Hello! How are you?",
      "Good morning, teacher!",
      "Good afternoon! How are you?",
      "Good evening, uncle!",
      "Goodbye! See you tomorrow.",
      "Nice to meet you.",
      "Thank you very much.",
      "You are welcome.",
      "Excuse me, may I come in?",
      "Have a great day!",
    ],
  },
  "Animals": {
    emoji: "🐘", color: "from-yellow-400 to-orange-500", curriculum: "Samacheer • 1st & 2nd",
    items: [
      "The cat sat on the mat.",
      "The dog barks loudly.",
      "The elephant is very big.",
      "The rabbit hops quickly.",
      "The bird sings a sweet song.",
      "The fish swims in water.",
      "The cow gives us milk.",
      "The hen lays eggs every day.",
      "The lion is the king of the jungle.",
      "The butterfly is very colourful.",
    ],
  },
  "Rhymes": {
    emoji: "🎵", color: "from-purple-400 to-pink-500", curriculum: "Merry Birds • Pre-KG to 3rd",
    items: [
      "Twinkle twinkle little star, how I wonder what you are.",
      "Baa baa black sheep, have you any wool?",
      "Humpty Dumpty sat on a wall.",
      "Jack and Jill went up the hill to fetch a pail of water.",
      "Mary had a little lamb, its fleece was white as snow.",
      "Old MacDonald had a farm, E-I-E-I-O.",
      "The wheels on the bus go round and round.",
      "Rain rain go away, come again another day.",
      "Hickory dickory dock, the mouse ran up the clock.",
      "Row row row your boat gently down the stream.",
    ],
  },
  "Simple Sentences": {
    emoji: "📝", color: "from-blue-400 to-cyan-500", curriculum: "Samacheer • 1st–3rd",
    items: [
      "I go to school every day.",
      "My name is Arjun.",
      "I like to read books.",
      "Today is a sunny day.",
      "I eat rice and vegetables for lunch.",
      "My mother is very kind.",
      "The sky is blue and the grass is green.",
      "I brush my teeth every morning.",
      "Please open the window.",
      "The flowers in the garden are very beautiful.",
    ],
  },
  "Pronunciation": {
    emoji: "🗣️", color: "from-red-400 to-rose-500", curriculum: "All Grades • Phonics",
    items: [
      "Think about the thing.",
      "This is the third Thursday.",
      "She sells seashells by the seashore.",
      "The thirty-three thieves thought that they thrilled the throne.",
      "Whether the weather is warm or whether it is cold.",
      "Red lorry, yellow lorry.",
      "Fresh French fried fish.",
      "Three free throws.",
      "I thought I thought of thinking of thanking you.",
      "The sixth sick sheik's sixth sheep is sick.",
    ],
  },
  "Colours & Shapes": {
    emoji: "🌈", color: "from-teal-400 to-green-500", curriculum: "Merry Birds • LKG–1st",
    items: [
      "The sky is blue.",
      "Roses are red, violets are blue.",
      "The sun is yellow and bright.",
      "Grass is green and fresh.",
      "An orange is orange in colour.",
      "A circle is round.",
      "A square has four equal sides.",
      "A triangle has three corners.",
      "The ball is round and red.",
      "I can draw a star shape.",
    ],
  },
  "Numbers": {
    emoji: "🔢", color: "from-indigo-400 to-purple-500", curriculum: "Samacheer • KG–2nd",
    items: [
      "One two three four five, once I caught a fish alive.",
      "Six seven eight nine ten, then I let it go again.",
      "Count from one to ten.",
      "I have two hands and ten fingers.",
      "There are seven days in a week.",
      "There are twelve months in a year.",
      "Two plus two equals four.",
      "Five minus three equals two.",
      "The clock shows three o'clock.",
      "I have thirty students in my class.",
    ],
  },
  "Body Parts": {
    emoji: "🖐️", color: "from-orange-400 to-amber-500", curriculum: "Merry Birds • LKG–UKG",
    items: [
      "I have two eyes to see.",
      "I have two ears to hear.",
      "I have a nose to smell.",
      "I have a mouth to eat and speak.",
      "I have two hands to hold.",
      "I have two legs to walk.",
      "My hair is black and curly.",
      "I wash my face every morning.",
      "My teeth are white and clean.",
      "I use my fingers to write.",
    ],
  },
  "Food & Fruits": {
    emoji: "🍎", color: "from-red-400 to-orange-400", curriculum: "Samacheer • 1st–3rd",
    items: [
      "An apple a day keeps the doctor away.",
      "I like to eat bananas.",
      "Mangoes are sweet and juicy.",
      "I drink a glass of milk every day.",
      "Rice is the staple food of Tamil Nadu.",
      "I love eating idli with sambar.",
      "Vegetables help us stay healthy.",
      "I eat breakfast before going to school.",
      "A coconut has a hard shell.",
      "Grapes are small and sweet.",
    ],
  },
  "Conversation": {
    emoji: "💬", color: "from-pink-400 to-fuchsia-500", curriculum: "All Grades • Oral Practice",
    items: [
      "What is your name?",
      "How old are you?",
      "Where do you live?",
      "What is your favourite colour?",
      "What do you like to eat?",
      "What is your favourite subject?",
      "Tell me about your best friend.",
      "What do you do after school?",
      "What is your favourite animal?",
      "How do you come to school?",
    ],
  },
};

const STAR_MESSAGES: Record<number, { text: string; emoji: string; color: string }> = {
  5: { text: "Amazing! Perfect!", emoji: "🏆", color: "text-yellow-500" },
  4: { text: "Very Good!", emoji: "🌟", color: "text-green-500" },
  3: { text: "Good Try!", emoji: "👍", color: "text-blue-500" },
  2: { text: "Keep Trying!", emoji: "💪", color: "text-orange-500" },
  1: { text: "Let's Try Again!", emoji: "🔄", color: "text-red-500" },
};

type Screen = "home" | "practice" | "conversation";

interface WordDiff {
  expected: string;
  got: string;
  correct: boolean;
  distance: number;
}

interface Feedback {
  stars: number;
  feedback: string;
  tamilFeedback?: string;
  improvement?: string;
  encouragement?: string;
  nextWord?: string;
  correctWordDemo?: string;
  wrongWord?: string;
  correctWord?: string;
  wordDiffs?: WordDiff[];
  accuracyScore?: number;
}

interface ConvMessage { role: "ai" | "user"; text: string }

// ── Helpers ────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function tts(text: string, voiceKey: VoiceKey, grade: string, speed?: number): Promise<HTMLAudioElement | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ text, voiceKey, grade, speed }),
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

// ── Sub-components ──────────────────────────────────────────────────────────
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
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
          <span className="absolute inset-[-8px] rounded-full border-2 border-red-300 animate-ping opacity-30" />
        </>
      )}
      {isRecording ? (
        <MicOff className="h-10 w-10 text-white relative z-10" />
      ) : (
        <Mic className="h-10 w-10 text-white relative z-10" />
      )}
    </button>
  );
}

// Word-level diff display
function WordDiffDisplay({ diffs, targetText }: { diffs: WordDiff[]; targetText: string }) {
  if (!diffs || diffs.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Word-by-word analysis:</p>
      <div className="flex flex-wrap gap-2">
        {diffs.map((d, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold",
              d.correct
                ? "bg-green-100 text-green-700"
                : d.got
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-400"
            )}
            title={!d.correct && d.got ? `You said: "${d.got}"` : d.correct ? "Correct!" : "Missing"}
          >
            {d.correct ? (
              <Check className="h-3 w-3" />
            ) : (
              <XIcon className="h-3 w-3" />
            )}
            {d.expected || "—"}
            {!d.correct && d.got && d.expected && (
              <span className="text-xs opacity-70 font-normal">({d.got})</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// Voice picker modal
function VoicePickerModal({
  selected,
  onSelect,
  onClose,
}: {
  selected: VoiceKey;
  onSelect: (k: VoiceKey) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl animate-slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-gray-800">🎙️ Choose Voice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="h-5 w-5" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-3">Pick the voice that sounds clearest to you:</p>
        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
          {VOICE_OPTIONS.map((v) => (
            <button
              key={v.key}
              onClick={() => { onSelect(v.key); onClose(); }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                selected === v.key
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
              )}
            >
              <span className="text-2xl">{v.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{v.label}</p>
                <p className="text-xs text-gray-500">{v.desc} · {v.gender === "female" ? "Female 👩" : "Male 👨"}</p>
              </div>
              {selected === v.key && <Check className="h-5 w-5 text-green-500 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function SpokenEnglish() {
  const [screen, setScreen] = useState<Screen>("home");
  const [grade, setGrade] = useState("1st");
  const [topic, setTopic] = useState("Greetings");
  const [tamilMode, setTamilMode] = useState(false);
  const [voiceKey, setVoiceKey] = useState<VoiceKey>("laura");
  const [showVoicePicker, setShowVoicePicker] = useState(false);
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
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const convBottomRef = useRef<HTMLDivElement>(null);

  const topicData = TOPICS[topic];
  const currentSentence = topicData.items[currentIndex % topicData.items.length];
  const gradeSpeed = GRADE_SPEED[grade] ?? 0.85;

  useEffect(() => {
    convBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    setIsDemoPlaying(false);
  }, []);

  const speak = useCallback(async (text: string, speed?: number, demo = false) => {
    stopAudio();
    if (demo) setIsDemoPlaying(true); else setIsPlaying(true);
    const audio = await tts(text, voiceKey, grade, speed);
    if (!audio) { setIsPlaying(false); setIsDemoPlaying(false); return; }
    audioRef.current = audio;
    audio.onended = () => { setIsPlaying(false); setIsDemoPlaying(false); };
    audio.play();
  }, [stopAudio, voiceKey, grade]);

  const startRecording = useCallback(async () => {
    try {
      stopAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(100);
      mediaRef.current = mr;
      setIsRecording(true);
    } catch {
      alert("Please allow microphone access to use this feature.");
    }
  }, [stopAudio]);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const mr = mediaRef.current;
      if (!mr || mr.state === "inactive") return resolve(new Blob());
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
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
      "Food & Fruits": "Hello! Do you like fruits? What is your favourite fruit?",
      Rhymes: "Hi! Let us say a rhyme together. Do you know Twinkle Twinkle Little Star?",
      default: "Hello! Let us practice speaking English together. How are you?",
    };
    const aiText = starters[topic] || starters.default;
    setConvMessages([{ role: "ai", text: aiText }]);
    await speak(aiText, gradeSpeed);
  }, [topic, speak, gradeSpeed]);

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
        await speak(aiReply, gradeSpeed);
      } catch {
        setConvMessages((prev) => [...prev, { role: "ai", text: "I did not catch that. Please try again!" }]);
      }
      setIsProcessing(false);
    } else {
      stopAudio();
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, grade, topic, convMessages, tamilMode, speak, stopAudio, gradeSpeed]);

  const currentVoice = VOICE_OPTIONS.find((v) => v.key === voiceKey) || VOICE_OPTIONS[0];

  // ── Render: Home ──────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex flex-col overflow-x-hidden">
        {showVoicePicker && (
          <VoicePickerModal selected={voiceKey} onSelect={setVoiceKey} onClose={() => setShowVoicePicker(false)} />
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-5 text-white text-center shadow-lg">
          <div className="text-4xl mb-1">🗣️</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Spoken English</h1>
          <p className="text-green-100 text-sm mt-0.5">Practice App for Kids • Nethaji Vidhyalayam</p>
        </div>

        {/* PWA Install Banner */}
        <div className="max-w-md mx-auto w-full pt-3">
          <PWAInstallBanner
            appName="Spoken English Practice"
            appEmoji="🗣️"
            appColor="from-green-500 to-emerald-600"
            description="Practice offline • Works without internet • Save to home screen"
          />
        </div>

        <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full space-y-5">
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

          {/* Voice Selector */}
          <button
            onClick={() => setShowVoicePicker(true)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-purple-100 hover:border-purple-300 transition-all"
          >
            <span className="text-2xl">{currentVoice.emoji}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-700">🎙️ Voice: {currentVoice.label}</p>
              <p className="text-xs text-gray-400">{currentVoice.desc} · tap to change</p>
            </div>
            <Settings className="h-4 w-4 text-gray-400" />
          </button>

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
                  ? `bg-gradient-to-br ${data.color} text-white border-transparent shadow-lg`
                      : "bg-white border-gray-200 text-gray-700"
                  )}
                >
                  <span className="text-xl">{data.emoji}</span>
                  <p className="mt-1 text-xs leading-tight">{name}</p>
                  {topic !== name && (
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{data.curriculum}</p>
                  )}
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
              className={cn("w-12 h-6 rounded-full transition-colors relative", tamilMode ? "bg-orange-500" : "bg-gray-300")}
            >
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", tamilMode ? "left-6" : "left-0.5")} />
            </button>
          </div>

          {/* Mode Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => { setCurrentIndex(0); setFeedback(null); setSpokenText(""); setShowResult(false); setScreen("practice"); }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg active:opacity-90 transition-opacity touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                <div className="text-left">
                  <p className="font-extrabold text-lg">Practice Mode</p>
                  <p className="text-green-100 text-xs">Repeat sentences • Get star rating</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6" />
            </button>

            <button
              onClick={() => { setConvMessages([]); setConvStarted(false); setFeedback(null); setScreen("conversation"); }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg active:opacity-90 transition-opacity touch-manipulation"
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
              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-500" /> Session Score
              </p>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 items-end">
                  {sessionScore.slice(-10).map((s, i) => (
                    <div key={i} className="flex flex-col justify-end" style={{ height: 32 }}>
                      <div
                        className={cn("w-4 rounded-t-sm", s >= 4 ? "bg-green-400" : s >= 3 ? "bg-yellow-400" : "bg-red-400")}
                        style={{ height: `${(s / 5) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-lg font-black text-gray-800">
                    {(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length).toFixed(1)} ⭐
                  </p>
                  <p className="text-xs text-gray-500">{sessionScore.length} rounds</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Practice ──────────────────────────────────────────────────────
  if (screen === "practice") {
    const starInfo = feedback ? STAR_MESSAGES[feedback.stars] || STAR_MESSAGES[1] : null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-green-50 to-emerald-50 flex flex-col overflow-x-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${topicData.color} px-4 py-4 text-white shadow-lg flex-shrink-0`}>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button onClick={() => { stopAudio(); setScreen("home"); }} className="p-1 rounded-full bg-white/20 touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-extrabold text-lg">{topicData.emoji} {topic}</p>
              <p className="text-xs text-white/80">Grade {grade} • {currentVoice.emoji} {currentVoice.label}</p>
            </div>
            <button onClick={() => setShowVoicePicker(true)} className="p-1 rounded-full bg-white/20 touch-manipulation">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showVoicePicker && (
          <VoicePickerModal selected={voiceKey} onSelect={setVoiceKey} onClose={() => setShowVoicePicker(false)} />
        )}

        <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
          {/* Curriculum badge */}
          <div className="text-center">
            <span className="text-xs bg-white text-gray-500 px-3 py-1 rounded-full border border-gray-200 font-medium">
              📖 {topicData.curriculum}
            </span>
          </div>

          {/* Sentence Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100 text-center">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Say this sentence:</p>
            <p className="text-xl font-bold text-gray-800 leading-relaxed">{currentSentence}</p>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(currentSentence, gradeSpeed)}
                disabled={isPlaying || isRecording || isDemoPlaying}
                className="gap-1 text-green-700 border-green-200 hover:bg-green-50"
              >
                <Volume2 className="h-4 w-4" /> {isPlaying ? "Playing…" : "Listen"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(currentSentence, Math.max(0.7, gradeSpeed - 0.08))}
                disabled={isPlaying || isRecording || isDemoPlaying}
                className="gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <Play className="h-4 w-4" /> Slow
              </Button>
            </div>
          </div>

          {/* Mic Section */}
      <div className="flex flex-col items-center gap-3" style={{ minHeight: 120 }}>
            <MicButton isRecording={isRecording} onClick={handleMicToggle} disabled={isProcessing || isPlaying} />
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
            <div className="bg-white rounded-3xl p-5 shadow-md border border-yellow-100 animate-fade-in space-y-3">
              {/* Stars + accuracy */}
              <StarRating stars={feedback.stars} animate />
              {feedback.accuracyScore !== undefined && (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", feedback.accuracyScore >= 75 ? "bg-green-400" : feedback.accuracyScore >= 50 ? "bg-yellow-400" : "bg-red-400")}
                      style={{ width: `${feedback.accuracyScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-10">{feedback.accuracyScore}%</span>
                </div>
              )}

              {starInfo && (
                <p className={cn("text-center font-extrabold text-lg", starInfo.color)}>
                  {starInfo.emoji} {starInfo.text}
                </p>
              )}

              <p className="text-gray-700 text-sm text-center leading-relaxed">{feedback.feedback}</p>

              {/* Word-level diff */}
              {feedback.wordDiffs && feedback.wordDiffs.length > 0 && (
                <WordDiffDisplay diffs={feedback.wordDiffs} targetText={currentSentence} />
              )}

              {/* Mistake highlight + TTS demo */}
              {feedback.wrongWord && feedback.correctWord && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-2">🔍 Pronunciation Fix:</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg text-sm line-through">
                      {feedback.wrongWord}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg text-sm">
                      {feedback.correctWord}
                    </span>
                  </div>
                  {feedback.correctWordDemo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 w-full"
                      disabled={isDemoPlaying || isPlaying}
                      onClick={() => speak(feedback.correctWordDemo!, gradeSpeed, true)}
                    >
                      <Volume2 className="h-4 w-4" />
                      {isDemoPlaying ? "Playing demo…" : `🔊 Hear correct: "${feedback.correctWord}"`}
                    </Button>
                  )}
                </div>
              )}

              {/* Improvement tip */}
              {feedback.improvement && (
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-600 font-bold">💡 Tip:</p>
                  <p className="text-xs text-orange-700 mt-0.5">{feedback.improvement}</p>
                </div>
              )}

              {/* Tamil help */}
              {tamilMode && feedback.tamilFeedback && (
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-bold">🌺 Tamil Help:</p>
                  <p className="text-xs text-green-700 mt-0.5" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                    {feedback.tamilFeedback}
                  </p>
                </div>
              )}

              {feedback.encouragement && (
                <p className="text-center text-sm font-bold text-purple-600">{feedback.encouragement}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
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
          <div className="flex gap-1 justify-center flex-wrap pb-2">
            {topicData.items.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === currentIndex % topicData.items.length ? "bg-green-500 w-4" : i < currentIndex ? "bg-green-300 w-2" : "bg-gray-200 w-2"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Conversation ──────────────────────────────────────────────────
  if (screen === "conversation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 flex flex-col overflow-x-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-4 text-white shadow-lg flex-shrink-0">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button onClick={() => { stopAudio(); setScreen("home"); }} className="p-1 rounded-full bg-white/20 touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-extrabold text-lg">💬 Talk with Sparky</p>
              <p className="text-xs text-white/80">Grade {grade} • {topic} • {currentVoice.emoji} {currentVoice.label}</p>
            </div>
            <button onClick={() => setShowVoicePicker(true)} className="p-1 rounded-full bg-white/20 touch-manipulation">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showVoicePicker && (
          <VoicePickerModal selected={voiceKey} onSelect={setVoiceKey} onClose={() => setShowVoicePicker(false)} />
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full space-y-3">
          {!convStarted && (
            <div className="text-center mt-8">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-lg font-bold text-gray-700">Hi! I'm Sparky!</p>
              <p className="text-gray-500 text-sm mb-2">Your friendly English conversation partner</p>
              <p className="text-xs text-gray-400 mb-6">Topic: <strong>{topic}</strong> • Grade {grade}</p>
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
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🤖</div>
              )}
              <div
                className={cn(
                  "max-w-[78%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                  msg.role === "ai" ? "bg-white text-gray-800 rounded-tl-sm" : "bg-purple-500 text-white rounded-tr-sm"
                )}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm mr-2">🤖</div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={convBottomRef} />
        </div>

        {/* Pronunciation tip during conversation */}
        {feedback?.improvement && (
          <div className="mx-4 mb-1 max-w-md mx-auto">
            <div className="bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
              <p className="text-xs text-orange-600 font-bold">💡 {feedback.improvement}</p>
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {isPlaying && (
          <div className="mx-4 mb-1 max-w-md mx-auto">
            <div className="bg-purple-50 rounded-xl px-3 py-2 border border-purple-100 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-400 rounded-full animate-bounce"
                    style={{ height: 12 + (i % 2) * 6, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-purple-600 font-bold">🔊 Sparky is speaking…</p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        {convStarted && (
          <div className="pb-6 pt-2 flex flex-col items-center gap-2 max-w-md mx-auto w-full">
            <MicButton isRecording={isRecording} onClick={handleConvMic} disabled={isProcessing || isPlaying} />
            <p className="text-xs text-gray-500">
              {isProcessing ? "⏳ Thinking…" : isRecording ? "🔴 Listening… tap to send" : "Tap to speak"}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
