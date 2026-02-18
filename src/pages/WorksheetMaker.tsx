import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Printer,
  Sparkles,
  Loader2,
  Trash2,
  GraduationCap,
  FileText,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question?: string;
  answer?: string;
  options?: string[];
  left?: string[];
  right?: string[];
  answers?: string[];
}

interface Section {
  type: string;
  heading: string;
  questions: Question[];
}

interface Worksheet {
  title: string;
  grade: string;
  subject: string;
  topic: string;
  instructions: string;
  sections: Section[];
}

interface SavedWorksheet {
  id: string;
  title: string;
  savedAt: string;
  worksheet: Worksheet;
  formData: FormData_;
}

interface FormData_ {
  grade: string;
  subject: string;
  topic: string;
  numQuestions: number;
  language: string;
  difficulty: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GRADES = ["LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];
const SUBJECTS = ["Tamil", "English", "Maths", "EVS/Science", "Social Studies"];
const LANGUAGES = ["English", "Tamil", "Bilingual"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WorksheetMaker() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData_>({
    grade: "3rd",
    subject: "Maths",
    topic: "",
    numQuestions: 10,
    language: "English",
    difficulty: "Medium",
  });
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savedList, setSavedList] = useState<SavedWorksheet[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("samacheer_worksheets") || "[]");
    } catch {
      return [];
    }
  });
  const [showSaved, setShowSaved] = useState(false);

  // ─── Generate ─────────────────────────────────────────────────────────────

  const generate = async () => {
    if (!formData.topic.trim()) {
      toast({ title: "Please enter a topic", description: "e.g. Addition, Animals, எழுத்துக்கள்", variant: "destructive" });
      return;
    }
    setLoading(true);
    setWorksheet(null);
    setShowAnswers(false);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-worksheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
      setWorksheet(data.worksheet);
      toast({ title: "Worksheet generated! ✨", description: "Scroll down to view your worksheet." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate worksheet";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const saveWorksheet = () => {
    if (!worksheet) return;
    const saved: SavedWorksheet = {
      id: Date.now().toString(),
      title: worksheet.title,
      savedAt: new Date().toLocaleDateString("en-IN"),
      worksheet,
      formData,
    };
    const updated = [saved, ...savedList].slice(0, 20);
    setSavedList(updated);
    localStorage.setItem("samacheer_worksheets", JSON.stringify(updated));
    toast({ title: "Saved! 💾", description: "Worksheet saved to your list." });
  };

  const deleteSaved = (id: string) => {
    const updated = savedList.filter((w) => w.id !== id);
    setSavedList(updated);
    localStorage.setItem("samacheer_worksheets", JSON.stringify(updated));
  };

  const loadSaved = (saved: SavedWorksheet) => {
    setWorksheet(saved.worksheet);
    setFormData(saved.formData);
    setShowSaved(false);
    toast({ title: "Worksheet loaded!", description: saved.title });
  };

  // ─── Print / PDF ──────────────────────────────────────────────────────────

  const handlePrint = () => {
    setShowAnswers(true);
    setTimeout(() => window.print(), 300);
  };

  // ─── Edit helpers ─────────────────────────────────────────────────────────

  const updateQuestion = (sIdx: number, qIdx: number, field: string, value: string) => {
    if (!worksheet) return;
    const updated = { ...worksheet };
    updated.sections = worksheet.sections.map((s, si) =>
      si === sIdx
        ? {
            ...s,
            questions: s.questions.map((q, qi) =>
              qi === qIdx ? { ...q, [field]: value } : q
            ),
          }
        : s
    );
    setWorksheet(updated);
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderSection = (section: Section, sIdx: number) => {
    switch (section.type) {
      case "fill_in_blanks":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className="mb-4">
            <p className="font-medium text-gray-800 print:text-black">
              <span className="font-bold mr-2">{q.id}.</span>
              {editMode ? (
                <input
                  className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent"
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)}
                />
              ) : (
                q.question
              )}
            </p>
            {showAnswers && (
              <p className="text-green-700 text-sm mt-1 ml-6 print:text-green-800">
                ✓ <strong>{q.answer}</strong>
              </p>
            )}
          </div>
        ));

      case "multiple_choice":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className="mb-5">
            <p className="font-medium text-gray-800 print:text-black mb-2">
              <span className="font-bold mr-2">{q.id}.</span>
              {editMode ? (
                <input
                  className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent"
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)}
                />
              ) : (
                q.question
              )}
            </p>
            <div className="grid grid-cols-2 gap-2 ml-6">
              {q.options?.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded-sm shrink-0 print:border-black" />
                  <span className="text-sm text-gray-700 print:text-black">{opt}</span>
                </label>
              ))}
            </div>
            {showAnswers && (
              <p className="text-green-700 text-sm mt-1 ml-6 print:text-green-800">
                ✓ <strong>{q.answer}</strong>
              </p>
            )}
          </div>
        ));

      case "match_following":
        return section.questions.map((q) => (
          <div key={q.id} className="mb-4">
            <div className="grid grid-cols-2 gap-8 ml-4">
              <div className="space-y-3">
                <p className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Column A</p>
                {q.left?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-bold text-gray-600 w-6">{i + 1}.</span>
                    <span className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 print:border-black">{item}</span>
                    <div className="w-12 border-b border-dashed border-gray-400 print:border-black" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Column B</p>
                {q.right?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-bold text-gray-600 w-6">{String.fromCharCode(97 + i)}.</span>
                    <span className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 print:border-black">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {showAnswers && (
              <div className="mt-3 ml-4 p-2 bg-green-50 rounded print:bg-transparent print:border print:border-green-600">
                <p className="text-green-700 text-sm font-medium print:text-green-800">
                  ✓ Answers: {q.left?.map((l, i) => `${i + 1}→${q.answers?.[i]}`).join(", ")}
                </p>
              </div>
            )}
          </div>
        ));

      case "short_answer":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className="mb-6">
            <p className="font-medium text-gray-800 print:text-black mb-2">
              <span className="font-bold mr-2">{q.id}.</span>
              {editMode ? (
                <input
                  className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent"
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)}
                />
              ) : (
                q.question
              )}
            </p>
            <div className="ml-6 space-y-2">
              <div className="border-b border-gray-300 h-6 print:border-black" />
              <div className="border-b border-gray-300 h-6 print:border-black" />
            </div>
            {showAnswers && (
              <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-800">
                ✓ <strong>{q.answer}</strong>
              </p>
            )}
          </div>
        ));

      default:
        return null;
    }
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-blue-50">
      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Serif+Tamil:wght@400;700&family=Baloo+2:wght@400;600;700;800&display=swap');
        
        .tamil-font { font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', sans-serif; }
        .heading-font { font-family: 'Baloo 2', 'Noto Sans Tamil', sans-serif; }

        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .worksheet-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="no-print bg-gradient-to-r from-sky-600 to-emerald-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="heading-font text-3xl md:text-4xl font-extrabold">Samacheer Worksheet Maker</h1>
          </div>
          <p className="text-sky-100 text-sm md:text-base max-w-xl mx-auto">
            AI-powered worksheets aligned with Tamil Nadu Samacheer Kalvi curriculum for LKG – 5th Standard
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Form Card ── */}
        <div className="no-print bg-white rounded-2xl shadow-lg border border-sky-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h2 className="heading-font text-xl font-bold text-gray-800">Create Your Worksheet</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Grade */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Grade / Class</Label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Subject</Label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Topic / Chapter Name
              </Label>
              <Input
                placeholder="e.g. Addition, Animals and their homes, எழுத்துக்கள், Parts of a plant..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="tamil-font bg-sky-50 border-gray-200 focus:ring-sky-400 text-base"
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
            </div>

            {/* Number of Questions */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Number of Questions: <span className="text-sky-600">{formData.numQuestions}</span>
              </Label>
              <input
                type="range"
                min={5}
                max={20}
                value={formData.numQuestions}
                onChange={(e) => setFormData({ ...formData, numQuestions: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>

            {/* Language */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Language</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setFormData({ ...formData, language: l })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                      formData.language === l
                        ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Difficulty Level</Label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => {
                  const colors: Record<string, string> = {
                    Easy: "border-emerald-500 bg-emerald-500",
                    Medium: "border-amber-500 bg-amber-500",
                    Hard: "border-red-500 bg-red-500",
                  };
                  const hoverColors: Record<string, string> = {
                    Easy: "hover:border-emerald-400",
                    Medium: "hover:border-amber-400",
                    Hard: "hover:border-red-400",
                  };
                  return (
                    <button
                      key={d}
                      onClick={() => setFormData({ ...formData, difficulty: d })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        formData.difficulty === d
                          ? `${colors[d]} text-white shadow-sm`
                          : `border-gray-200 bg-gray-50 text-gray-600 ${hoverColors[d]}`
                      }`}
                    >
                      {d === "Easy" ? "🟢 Easy" : d === "Medium" ? "🟡 Medium" : "🔴 Hard"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full mt-6 h-14 text-lg font-bold bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating Worksheet…
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Worksheet
              </>
            )}
          </Button>

          {/* Saved list toggle */}
          {savedList.length > 0 && (
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="mt-3 w-full text-sm text-sky-600 hover:text-sky-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="h-4 w-4" />
              {showSaved ? "Hide" : "View"} My Saved Worksheets ({savedList.length})
            </button>
          )}

          {/* Saved worksheets */}
          {showSaved && savedList.length > 0 && (
            <div className="mt-4 border border-sky-100 rounded-xl overflow-hidden">
              {savedList.map((sw) => (
                <div
                  key={sw.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-sky-50 last:border-0 hover:bg-sky-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{sw.title}</p>
                    <p className="text-xs text-gray-400">{sw.savedAt}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => loadSaved(sw)} className="text-xs h-7">
                      Load
                    </Button>
                    <button onClick={() => deleteSaved(sw.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="no-print text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin" />
                <BookOpen className="absolute inset-0 m-auto h-7 w-7 text-sky-500" />
              </div>
              <div>
                <p className="text-gray-700 font-bold text-lg">Creating your worksheet…</p>
                <p className="text-gray-400 text-sm mt-1">AI is aligning with Samacheer Kalvi curriculum</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Worksheet ── */}
        {worksheet && !loading && (
          <>
            {/* Action bar */}
            <div className="no-print flex flex-wrap gap-2 mb-4">
              <Button onClick={handlePrint} variant="outline" className="gap-2 border-gray-300">
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
              <Button
                onClick={() => setShowAnswers(!showAnswers)}
                variant="outline"
                className="gap-2 border-gray-300"
              >
                {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAnswers ? "Hide Answers" : "Show Answer Key"}
              </Button>
              <Button
                onClick={() => setEditMode(!editMode)}
                variant="outline"
                className={`gap-2 ${editMode ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-300"}`}
              >
                <FileText className="h-4 w-4" />
                {editMode ? "Done Editing" : "Edit Questions"}
              </Button>
              <Button onClick={saveWorksheet} variant="outline" className="gap-2 border-gray-300">
                <Save className="h-4 w-4" /> Save to My List
              </Button>
              <Button onClick={generate} variant="outline" className="gap-2 border-gray-300">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button
                onClick={handlePrint}
                className="gap-2 bg-sky-600 hover:bg-sky-700 text-white ml-auto"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>

            {/* Worksheet document */}
            <div
              className="worksheet-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              id="worksheet"
            >
              {/* Worksheet header */}
              <div className="bg-gradient-to-r from-sky-600 to-emerald-600 print:bg-none print:border-b-4 print:border-sky-600 text-white print:text-black px-8 py-6 print:py-4">
                <div className="text-center">
                  <h2 className="heading-font tamil-font text-xl md:text-2xl font-extrabold leading-snug print:text-black">
                    {worksheet.title}
                  </h2>
                  <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
                    <span className="text-sm bg-white/20 print:bg-transparent print:border print:border-gray-400 print:text-gray-700 text-white rounded-full px-3 py-0.5 font-semibold">
                      {worksheet.grade}
                    </span>
                    <span className="text-sm bg-white/20 print:bg-transparent print:border print:border-gray-400 print:text-gray-700 text-white rounded-full px-3 py-0.5 font-semibold">
                      {worksheet.subject}
                    </span>
                    <span className="text-sm bg-white/20 print:bg-transparent print:border print:border-gray-400 print:text-gray-700 text-white rounded-full px-3 py-0.5 font-semibold">
                      {formData.difficulty}
                    </span>
                    <span className="text-sm bg-white/20 print:bg-transparent print:border print:border-gray-400 print:text-gray-700 text-white rounded-full px-3 py-0.5 font-semibold">
                      {formData.language}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student info strip */}
              <div className="bg-sky-50 print:bg-transparent border-b border-sky-100 px-8 py-3">
                <div className="flex flex-wrap gap-8 text-sm">
                  <span className="text-gray-600">
                    Name: <span className="inline-block w-48 border-b border-gray-400 ml-1" />
                  </span>
                  <span className="text-gray-600">
                    Date: <span className="inline-block w-28 border-b border-gray-400 ml-1" />
                  </span>
                  <span className="text-gray-600">
                    Score: <span className="inline-block w-20 border-b border-gray-400 ml-1" />
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="px-8 py-4 bg-amber-50 print:bg-transparent border-b border-amber-100">
                <p className="tamil-font text-sm text-amber-800 print:text-gray-700 font-medium">
                  📋 <strong>Instructions:</strong> {worksheet.instructions}
                </p>
              </div>

              {/* Sections */}
              <div className="px-8 py-6 space-y-8">
                {worksheet.sections?.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h3 className="heading-font font-bold text-gray-900 text-base border-b-2 border-sky-200 print:border-gray-400 pb-2 mb-4">
                      {section.heading}
                    </h3>
                    <div className="tamil-font space-y-1">
                      {renderSection(section, sIdx)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Answer Key */}
              {showAnswers && (
                <div className="mx-8 mb-8 p-5 bg-green-50 print:bg-transparent border-2 border-green-200 print:border-green-600 rounded-xl">
                  <h3 className="heading-font font-bold text-green-800 print:text-green-900 text-base mb-4 flex items-center gap-2">
                    ✅ Answer Key
                  </h3>
                  <div className="space-y-4">
                    {worksheet.sections?.map((section, sIdx) => (
                      <div key={sIdx}>
                        <p className="text-xs font-bold text-green-600 print:text-green-800 uppercase tracking-wider mb-2">
                          {section.heading}
                        </p>
                        <div className="tamil-font grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.questions.map((q) => (
                            <p key={q.id} className="text-sm text-green-800 print:text-black">
                              <strong>{q.id}.</strong>{" "}
                              {section.type === "match_following"
                                ? q.left?.map((l, i) => `${l} → ${q.answers?.[i]}`).join(", ")
                                : q.answer}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 print:bg-transparent text-center">
                <p className="text-xs text-gray-400 print:text-gray-600">
                  Tamil Nadu Samacheer Kalvi Curriculum • Generated by Samacheer Worksheet Maker
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
