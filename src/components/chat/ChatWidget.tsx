import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-chat`;
const IDLE_TIMEOUT = 30000; // 30 seconds

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Welcome to Nethaji Vidhyalayam! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pulseAnim, setPulseAnim] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Pulse animation cycle for the floating button
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setPulseAnim((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, [open]);

  // Auto-collapse if idle for 30s (when chat is open)
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!open || minimized) return;
    idleTimerRef.current = setTimeout(() => {
      setMinimized(true);
    }, IDLE_TIMEOUT);
  }, [open, minimized]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [open, minimized, messages, input, resetIdleTimer]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok || !resp.body) {
      const err = await resp.json().catch(() => ({ error: "Failed" }));
      throw new Error(err.error || "Failed to connect");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantText += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
              }
              return [...prev, { role: "assistant", content: assistantText }];
            });
          }
        } catch {}
      }
    }
    return assistantText;
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);
    resetIdleTimer();

    try {
      const reply = await streamChat(updated);
      if (reply && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(reply.replace(/[#*_`]/g, ""));
        utt.rate = 1;
        utt.lang = "en-IN";
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      send(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleRestore = () => {
    setMinimized(false);
    resetIdleTimer();
  };

  return (
    <>
      {/* Floating button - always visible when chat is closed */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-center gap-2">
          {/* Close/dismiss X button */}
          <button
            onClick={() => setOpen(false)}
            className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform text-xs"
            aria-label="Dismiss chat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {/* Main chat button with dancing animation */}
          <button
            onClick={handleOpen}
            className={`w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
              pulseAnim
                ? "scale-110 shadow-[0_0_30px_rgba(var(--accent),0.5)] rotate-[5deg]"
                : "scale-100 shadow-lg rotate-[-3deg]"
            }`}
            style={{
              animation: "chat-bounce 2s ease-in-out infinite, chat-glow 3s ease-in-out infinite",
            }}
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Minimized bar - shown when chat is open but minimized */}
      {open && minimized && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
          <button
            onClick={handleRestore}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
            style={{
              animation: "chat-bounce 3s ease-in-out infinite",
            }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Nethaji AI</span>
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label="Close chat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Chat panel - z-[60] to overlap social sidebar (z-50) */}
      {open && !minimized && (
        <div className="fixed bottom-4 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] bg-card rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Nethaji AI Assistant</p>
                <p className="text-xs opacity-80">Ask me anything!</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimize / down arrow */}
              <button
                onClick={handleMinimize}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Minimize chat"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Close X */}
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onMouseMove={resetIdleTimer}
            onClick={resetIdleTimer}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm text-sm text-muted-foreground">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isListening ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  resetIdleTimer();
                }}
                placeholder="Type your question..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="shrink-0 w-9 h-9 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/90 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSS animations for the floating button */}
      <style>{`
        @keyframes chat-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes chat-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(var(--accent), 0.3); }
          50% { box-shadow: 0 0 25px rgba(var(--accent), 0.6), 0 0 50px rgba(var(--accent), 0.2); }
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
