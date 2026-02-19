import { useState, useEffect } from "react";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
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
  PenLine,
  List,
  CheckSquare,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question?: string;
  answer?: string;
  options?: string[];
  left?: string[];
  right?: string[];
  answers?: string[];
  diagramLabels?: string[];
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
  _hasDiagram?: boolean;
}

interface SavedWorksheet {
  id: string;
  title: string;
  savedAt: string;
  worksheet: Worksheet;
  formData: FormData_;
}

interface FormData_ {
  curriculum: string;
  term: string;
  grade: string;
  subject: string;
  topic: string;
  numQuestions: number;
  language: string;
  difficulty: string;
  questionTypes: string[];
}

// ─── Question Type Options ────────────────────────────────────────────────────
const QUESTION_TYPES = [
  { id: "multiple_choice",  label: "Multiple Choice",    emoji: "🔘", tamil: "பலவுள் தேர்வு" },
  { id: "fill_in_blanks",   label: "Fill in the Blanks", emoji: "✏️",  tamil: "காலி இடம்" },
  { id: "match_following",  label: "Match the Following",emoji: "🔗",  tamil: "பொருத்துக" },
  { id: "true_false",       label: "True or False",      emoji: "✅",  tamil: "சரி/தவறு" },
  { id: "short_answer",     label: "Short Answer",       emoji: "📝",  tamil: "குறு விடை" },
  { id: "diagram",          label: "Label/Draw",         emoji: "🖊️",  tamil: "படம் வரை" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRICULA = [
  "Samacheer Kalvi (Tamil Nadu State Board)",
  "Oxford Merry Birds (Integrated Term Course)",
];

const TERMS = ["Term 1", "Term 2", "Term 3"];

const GRADES = ["Pre-KG", "LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th"];

// Subjects per curriculum
const SAMACHEER_SUBJECTS = ["Tamil", "English", "Maths", "EVS/Science", "Social Studies"];
const MERRY_BIRDS_SUBJECTS = ["English", "Maths", "EVS/Science", "Social Studies", "General Knowledge"];

const LANGUAGES = ["English", "Tamil", "Bilingual"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STORAGE_KEY = "samacheer_worksheets_v2";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Topic suggestions: key = `${curricShort}-${term}-${grade}-${subject}`
// curricShort: "MB" = Merry Birds, "SK" = Samacheer Kalvi
const TOPIC_SUGGESTIONS_MAP: Record<string, string[]> = {

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — PRE-KG
  // ══════════════════════════════════════════════════════
  "MB-Term 1-Pre-KG-English":          ["Hello! My Name Is", "My Body Parts", "Colours Around Me"],
  "MB-Term 2-Pre-KG-English":          ["Animals I Know", "Fruits and Vegetables", "My Home"],
  "MB-Term 3-Pre-KG-English":          ["Transport", "Community Helpers", "Weather and Seasons"],
  "MB-Term 1-Pre-KG-Maths":            ["Numbers 1–5", "Shapes (Circle, Square)", "Big and Small"],
  "MB-Term 2-Pre-KG-Maths":            ["Numbers 6–10", "Tall and Short", "Patterns"],
  "MB-Term 3-Pre-KG-Maths":            ["Numbers 1–10 (Review)", "More and Less", "Inside and Outside"],
  "MB-Term 1-Pre-KG-EVS/Science":      ["My Senses", "My Family", "Plants Around Us"],
  "MB-Term 2-Pre-KG-EVS/Science":      ["Animals and their Sounds", "Food We Eat", "Clean Habits"],
  "MB-Term 3-Pre-KG-EVS/Science":      ["Water Uses", "Air Around Us", "Day and Night"],
  "MB-Term 1-Pre-KG-General Knowledge":["Days of the Week", "Colours", "Shapes I See"],
  "MB-Term 2-Pre-KG-General Knowledge":["Animals and Babies", "Fruits and Vegetables", "National Flag"],
  "MB-Term 3-Pre-KG-General Knowledge":["Birds of India", "Months of the Year", "Good Habits"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — LKG
  // ══════════════════════════════════════════════════════
  "MB-Term 1-LKG-English":          ["Alphabet A–E (Phonics)", "My School", "Animals and their Sounds"],
  "MB-Term 2-LKG-English":          ["Alphabet F–M (Phonics)", "My Family", "Action Words"],
  "MB-Term 3-LKG-English":          ["Alphabet N–Z (Phonics)", "My Neighbourhood", "Seasons"],
  "MB-Term 1-LKG-Maths":            ["Numbers 1–10", "Shapes (Triangle, Rectangle)", "Counting Objects"],
  "MB-Term 2-LKG-Maths":            ["Numbers 11–20", "Patterns", "Long and Short"],
  "MB-Term 3-LKG-Maths":            ["Numbers 1–20 (Review)", "Before and After", "Addition (intro)"],
  "MB-Term 1-LKG-EVS/Science":      ["My Body Parts", "My Family", "Plants Around Us"],
  "MB-Term 2-LKG-EVS/Science":      ["Animals and their Homes", "Food I Eat", "Water"],
  "MB-Term 3-LKG-EVS/Science":      ["Air and Wind", "Seasons", "Community Helpers"],
  "MB-Term 1-LKG-Social Studies":   ["My School", "My Home", "People Who Help Us"],
  "MB-Term 2-LKG-Social Studies":   ["My Village / City", "Transport (Land)", "Transport (Water, Air)"],
  "MB-Term 3-LKG-Social Studies":   ["National Symbols", "Festivals", "Good Citizens"],
  "MB-Term 1-LKG-General Knowledge":["Days of the Week", "Colours", "National Flag of India"],
  "MB-Term 2-LKG-General Knowledge":["Animals and their Babies", "Birds of India", "Fruits"],
  "MB-Term 3-LKG-General Knowledge":["Months and Seasons", "Famous Indians", "Good Habits"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — UKG
  // ══════════════════════════════════════════════════════
  "MB-Term 1-UKG-English":          ["Phonics – Short Vowel 'a'", "Simple CVC Words", "My Family"],
  "MB-Term 2-UKG-English":          ["Phonics – Short Vowels e/i", "Animals and their Habitats", "Community Helpers"],
  "MB-Term 3-UKG-English":          ["Phonics – Short Vowels o/u", "Simple Sentences", "Seasons and Weather"],
  "MB-Term 1-UKG-Maths":            ["Numbers 1–20", "Addition (Single Digit)", "Shapes"],
  "MB-Term 2-UKG-Maths":            ["Numbers 21–50", "Subtraction (Single Digit)", "Measurement (Long/Short)"],
  "MB-Term 3-UKG-Maths":            ["Numbers 51–100", "Patterns", "Time (Day/Night/Morning)"],
  "MB-Term 1-UKG-EVS/Science":      ["Plants and their Parts", "Animals (Domestic, Wild)", "Clean Habits"],
  "MB-Term 2-UKG-EVS/Science":      ["Food We Eat (Healthy vs Junk)", "Water Uses", "Air Around Us"],
  "MB-Term 3-UKG-EVS/Science":      ["Weather and Seasons", "Our Earth", "Light and Darkness"],
  "MB-Term 1-UKG-Social Studies":   ["My School", "My Village and City", "Land Transport"],
  "MB-Term 2-UKG-Social Studies":   ["Water Transport", "Air Transport", "Occupations"],
  "MB-Term 3-UKG-Social Studies":   ["Our Country India", "National Symbols", "Festivals of India"],
  "MB-Term 1-UKG-General Knowledge":["Days, Months, Seasons", "Animals and their Young", "National Symbols"],
  "MB-Term 2-UKG-General Knowledge":["Famous Persons of India", "World Around Us", "Sports"],
  "MB-Term 3-UKG-General Knowledge":["Inventions (Wheel, Fire)", "Human Body Facts", "Solar System (intro)"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 1
  // ══════════════════════════════════════════════════════
  "MB-Term 1-1st-English":          ["The Little Red Hen", "Phonics – Consonant Blends", "Articles a/an"],
  "MB-Term 2-1st-English":          ["The Magic Drum (Story)", "Nouns (Common & Proper)", "Action Verbs"],
  "MB-Term 3-1st-English":          ["The Honest Woodcutter", "Adjectives", "Simple Sentences & Punctuation"],
  "MB-Term 1-1st-Maths":            ["Numbers 1–100", "Addition (2-Digit)", "Subtraction"],
  "MB-Term 2-1st-Maths":            ["Multiplication (2x, 3x)", "Shapes and Patterns", "Measurement (CM)"],
  "MB-Term 3-1st-Maths":            ["Division (intro)", "Money", "Time (Hours)"],
  "MB-Term 1-1st-EVS/Science":      ["Plants Around Us", "Animals and their Young Ones", "Air and Water"],
  "MB-Term 2-1st-EVS/Science":      ["Food and Nutrition", "Our Senses", "Soil"],
  "MB-Term 3-1st-EVS/Science":      ["Weather", "Light and Shadow", "Simple Machines"],
  "MB-Term 1-1st-Social Studies":   ["My Home", "My School", "Community Helpers"],
  "MB-Term 2-1st-Social Studies":   ["Our Village and City", "Transport and Communication", "Markets"],
  "MB-Term 3-1st-Social Studies":   ["Our Country India", "National Symbols", "Festivals"],
  "MB-Term 1-1st-General Knowledge":["Days, Months, Seasons", "National Symbols of India", "Famous Personalities"],
  "MB-Term 2-1st-General Knowledge":["Animals – Interesting Facts", "Space (Sun, Moon, Stars)", "Sports and Games"],
  "MB-Term 3-1st-General Knowledge":["Inventions (Telephone, Bulb)", "India's History (intro)", "World Capitals (easy)"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 2
  // ══════════════════════════════════════════════════════
  "MB-Term 1-2nd-English":          ["The Hen and the Bee (Story)", "Nouns – Singular & Plural", "Rhyming Words"],
  "MB-Term 2-2nd-English":          ["The Clever Crow (Story)", "Pronouns (I, He, She, They)", "Question Words"],
  "MB-Term 3-2nd-English":          ["A Rainy Day (Poem)", "Adjectives", "Simple Story Writing"],
  "MB-Term 1-2nd-Maths":            ["3-Digit Numbers", "Addition with Carry", "Subtraction with Borrow"],
  "MB-Term 2-2nd-Maths":            ["Multiplication Tables 2–5", "Division (Basic)", "Fractions (Half, Quarter)"],
  "MB-Term 3-2nd-Maths":            ["Time and Calendar", "Money", "Data Handling (Tally)"],
  "MB-Term 1-2nd-EVS/Science":      ["Food and Health", "Water Cycle", "Animals (Adaptation)"],
  "MB-Term 2-2nd-EVS/Science":      ["Plants (Photosynthesis intro)", "Air (Uses)", "Soil Types"],
  "MB-Term 3-2nd-EVS/Science":      ["Weather and Seasons", "Simple Machines", "Light and Sound"],
  "MB-Term 1-2nd-Social Studies":   ["Our Country India", "Landforms (Mountains, Plains)", "Rivers of India"],
  "MB-Term 2-2nd-Social Studies":   ["Crops and Farming", "Occupations", "Transport"],
  "MB-Term 3-2nd-Social Studies":   ["Our Government", "National Symbols", "Environment Care"],
  "MB-Term 1-2nd-General Knowledge":["Inventions and Inventors", "World Records", "National Awards"],
  "MB-Term 2-2nd-General Knowledge":["Space Exploration", "Famous Scientists", "Countries and Capitals"],
  "MB-Term 3-2nd-General Knowledge":["World Leaders", "Sports Champions", "India's Heritage Sites"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 3
  // ══════════════════════════════════════════════════════
  "MB-Term 1-3rd-English":          ["The Camel's Hump (Poem)", "Tenses (Past, Present, Future)", "Letter Writing"],
  "MB-Term 2-3rd-English":          ["The Brave Little Tailor", "Adverbs", "Comprehension Passage"],
  "MB-Term 3-3rd-English":          ["Robinson Crusoe (excerpts)", "Conjunctions", "Essay Writing"],
  "MB-Term 1-3rd-Maths":            ["4-Digit Numbers", "Multiplication (3-digit x 1)", "Division"],
  "MB-Term 2-3rd-Maths":            ["Fractions", "Decimals (intro)", "Geometry (Angles)"],
  "MB-Term 3-3rd-Maths":            ["Area and Perimeter", "Time and Distance", "Data Handling"],
  "MB-Term 1-3rd-EVS/Science":      ["Plants and their Parts", "Adaptation in Animals", "Soil and Rocks"],
  "MB-Term 2-3rd-EVS/Science":      ["Food Chain and Ecosystem", "Water Cycle", "Air Pressure"],
  "MB-Term 3-3rd-EVS/Science":      ["Human Body Systems", "Force and Motion", "Light and Shadow"],
  "MB-Term 1-3rd-Social Studies":   ["Maps and Directions", "Our State Tamil Nadu", "Physical Features of India"],
  "MB-Term 2-3rd-Social Studies":   ["Climate of India", "Agriculture", "Transport and Communication"],
  "MB-Term 3-3rd-Social Studies":   ["Industries of India", "Our Government", "World Geography (basic)"],
  "MB-Term 1-3rd-General Knowledge":["Famous Scientists", "World Capitals", "Sports Champions"],
  "MB-Term 2-3rd-General Knowledge":["India's Freedom Struggle", "Inventions", "Animals – Fun Facts"],
  "MB-Term 3-3rd-General Knowledge":["Nobel Prize Winners", "World Heritage Sites", "Technology Today"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 4
  // ══════════════════════════════════════════════════════
  "MB-Term 1-4th-English":          ["Alice in Wonderland (Chapter 1)", "Active and Passive Voice", "Paragraph Writing"],
  "MB-Term 2-4th-English":          ["The Jungle Book (Story)", "Direct and Indirect Speech", "Dialogue Writing"],
  "MB-Term 3-4th-English":          ["Gulliver's Travels (excerpts)", "Prepositions", "Report Writing"],
  "MB-Term 1-4th-Maths":            ["Large Numbers (Lakhs, Crores)", "Factors and Multiples (LCM, HCF)", "Fractions"],
  "MB-Term 2-4th-Maths":            ["Decimals", "Percentage (intro)", "Geometry – Angles and Lines"],
  "MB-Term 3-4th-Maths":            ["Area and Perimeter", "Volume (Cuboid, Cube)", "Data Handling – Bar Graphs"],
  "MB-Term 1-4th-EVS/Science":      ["Human Body – Organ Systems", "Food Chain and Food Web", "Rocks and Minerals"],
  "MB-Term 2-4th-EVS/Science":      ["Reproduction in Plants", "Solar System", "Force and Pressure"],
  "MB-Term 3-4th-EVS/Science":      ["Light (Reflection)", "Sound", "Electricity (intro)"],
  "MB-Term 1-4th-Social Studies":   ["Physical Features of India", "Climate Zones", "Soils and Vegetation"],
  "MB-Term 2-4th-Social Studies":   ["Agriculture and Industries", "Transport and Trade", "Occupations"],
  "MB-Term 3-4th-Social Studies":   ["Our Constitution (intro)", "Human Rights", "World – Continents and Oceans"],
  "MB-Term 1-4th-General Knowledge":["Space Exploration", "World Leaders", "Indian History (Mughal Era)"],
  "MB-Term 2-4th-General Knowledge":["Famous Scientists and Inventions", "UNESCO Heritage Sites", "Sports Records"],
  "MB-Term 3-4th-General Knowledge":["Technology Milestones", "Environment and Climate", "Current Affairs (easy)"],

  // ══════════════════════════════════════════════════════
  // OXFORD MERRY BIRDS — CLASS 5
  // ══════════════════════════════════════════════════════
  "MB-Term 1-5th-English":          ["Adventures of Tom Sawyer", "Clauses and Phrases", "Essay Writing"],
  "MB-Term 2-5th-English":          ["Treasure Island (Story)", "Reported Speech", "Formal Letter Writing"],
  "MB-Term 3-5th-English":          ["Oliver Twist (excerpts)", "Idioms and Proverbs", "Story Writing"],
  "MB-Term 1-5th-Maths":            ["LCM and HCF", "Ratio and Proportion", "Percentage"],
  "MB-Term 2-5th-Maths":            ["Profit and Loss", "Simple Interest", "Algebra (intro)"],
  "MB-Term 3-5th-Maths":            ["Geometry (Quadrilaterals)", "Data Handling – Pie Charts", "Patterns and Sequences"],
  "MB-Term 1-5th-EVS/Science":      ["Reproduction in Plants and Animals", "Human Digestive System", "Ecosystems"],
  "MB-Term 2-5th-EVS/Science":      ["Electricity and Circuits", "Light (Lenses)", "Matter (States)"],
  "MB-Term 3-5th-EVS/Science":      ["Environment and Conservation", "Space – Planets and Satellites", "Technology in Daily Life"],
  "MB-Term 1-5th-Social Studies":   ["Ancient Civilizations", "Indian Constitution", "Natural Resources"],
  "MB-Term 2-5th-Social Studies":   ["Freedom Struggle of India", "Five Year Plans", "World Geography"],
  "MB-Term 3-5th-Social Studies":   ["Human Rights and Democracy", "Global Warming", "United Nations"],
  "MB-Term 1-5th-General Knowledge":["Nobel Prize Winners", "India's Space Missions", "World Records"],
  "MB-Term 2-5th-General Knowledge":["Famous Inventions and Inventors", "World Heritage Sites", "Sports Champions"],
  "MB-Term 3-5th-General Knowledge":["Current Affairs India", "Technology and AI", "Environmental Heroes"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — LKG
  // ══════════════════════════════════════════════════════
  "SK-Term 1-LKG-Tamil":    ["அ, ஆ, இ, ஈ", "குறில் எழுத்துக்கள்", "பழங்கள்"],
  "SK-Term 2-LKG-Tamil":    ["உ, ஊ, எ, ஏ", "நெடில் எழுத்துக்கள்", "விலங்குகள்"],
  "SK-Term 3-LKG-Tamil":    ["ஐ, ஒ, ஓ, ஔ", "உயிர் எழுத்துக்கள் (மொத்தம்)", "வண்ணங்கள்"],
  "SK-Term 1-LKG-English":  ["A B C (Phonics)", "Animals", "Colours"],
  "SK-Term 2-LKG-English":  ["D E F G (Phonics)", "Fruits", "Shapes"],
  "SK-Term 3-LKG-English":  ["H–Z (Phonics)", "My Body", "My Family"],
  "SK-Term 1-LKG-Maths":    ["Numbers 1–5", "Shapes (Circle, Square)", "Counting"],
  "SK-Term 2-LKG-Maths":    ["Numbers 6–10", "Big and Small", "Patterns"],
  "SK-Term 3-LKG-Maths":    ["Numbers 1–10 (Review)", "Addition (intro)", "Before and After"],
  "SK-Term 1-LKG-EVS/Science": ["My Body", "My Family", "Animals Around Me"],
  "SK-Term 2-LKG-EVS/Science": ["Plants and Flowers", "Food I Eat", "Water Uses"],
  "SK-Term 3-LKG-EVS/Science": ["Seasons", "Clean Habits", "Community Helpers"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — UKG
  // ══════════════════════════════════════════════════════
  "SK-Term 1-UKG-Tamil":    ["உயிர் எழுத்துக்கள்", "அகர வரிசை", "என் குடும்பம்"],
  "SK-Term 2-UKG-Tamil":    ["மெய் எழுத்துக்கள்", "சொல் படிக்கலாம்", "பூக்கள்"],
  "SK-Term 3-UKG-Tamil":    ["உயிர்மெய் எழுத்துக்கள் (intro)", "வாக்கியம் படிக்கலாம்", "நல்ல பழக்கங்கள்"],
  "SK-Term 1-UKG-English":  ["Phonics – Short 'a'", "CVC Words (cat, bat)", "My School"],
  "SK-Term 2-UKG-English":  ["Phonics – Short 'e' & 'i'", "Animals and Sounds", "My Family"],
  "SK-Term 3-UKG-English":  ["Phonics – Short 'o' & 'u'", "Simple Sentences", "Community Helpers"],
  "SK-Term 1-UKG-Maths":    ["Numbers 1–20", "Addition (Single Digit)", "Shapes"],
  "SK-Term 2-UKG-Maths":    ["Numbers 21–50", "Subtraction (Single Digit)", "Measurement"],
  "SK-Term 3-UKG-Maths":    ["Numbers 51–100", "Patterns", "Time (Day/Night)"],
  "SK-Term 1-UKG-EVS/Science": ["My Senses", "Plants (Parts)", "Animals (Domestic, Wild)"],
  "SK-Term 2-UKG-EVS/Science": ["Food and Health", "Water and its Uses", "Air"],
  "SK-Term 3-UKG-EVS/Science": ["Seasons and Weather", "Transport", "Festivals"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 1
  // ══════════════════════════════════════════════════════
  "SK-Term 1-1st-Tamil":    ["உயிர் எழுத்துக்கள்", "வல்லினம் மிகா இடம்", "பெயர்ச்சொல்"],
  "SK-Term 2-1st-Tamil":    ["மெய் எழுத்துக்கள்", "உயிர்மெய் எழுத்துக்கள்", "வினைச்சொல்"],
  "SK-Term 3-1st-Tamil":    ["அகர வரிசை", "எதிர்ச்சொல்", "ஒரே மாதிரியான சொற்கள்"],
  "SK-Term 1-1st-English":  ["My Body", "My School", "Animals and their Homes"],
  "SK-Term 2-1st-English":  ["Action Words (Verbs)", "Describing Words (Adjectives)", "Days of the Week"],
  "SK-Term 3-1st-English":  ["Seasons", "Community Helpers", "Simple Sentences"],
  "SK-Term 1-1st-Maths":    ["Numbers 1–100", "Addition (2-Digit)", "Subtraction"],
  "SK-Term 2-1st-Maths":    ["Shapes", "Measurement (Long/Short)", "Patterns"],
  "SK-Term 3-1st-Maths":    ["Money", "Time (Clock)", "Data (Tally)"],
  "SK-Term 1-1st-EVS/Science": ["Plants Around Us", "Animals and their Young Ones", "My Body"],
  "SK-Term 2-1st-EVS/Science": ["Food and Nutrition", "Water", "Air"],
  "SK-Term 3-1st-EVS/Science": ["Weather and Seasons", "Transport", "Community Helpers"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 2
  // ══════════════════════════════════════════════════════
  "SK-Term 1-2nd-Tamil":    ["உயிர்மெய் எழுத்துக்கள்", "பெயர்ச்சொல் வகைகள்", "கவிதை – தோட்டம்"],
  "SK-Term 2-2nd-Tamil":    ["வினைச்சொல்", "உவமை", "பாடல் – தாய்மொழி"],
  "SK-Term 3-2nd-Tamil":    ["சொல் விளையாட்டு", "எதிர்ச்சொல்", "புணர்ச்சி (intro)"],
  "SK-Term 1-2nd-English":  ["Action Words (Verbs)", "The Crow and the Pitcher (Story)", "Nouns"],
  "SK-Term 2-2nd-English":  ["Adjectives", "Pronouns", "Question Words (Who, What, Where)"],
  "SK-Term 3-2nd-English":  ["Rhyming Words", "Simple Story Writing", "Punctuation"],
  "SK-Term 1-2nd-Maths":    ["3-Digit Numbers", "Addition with Carry", "Subtraction with Borrow"],
  "SK-Term 2-2nd-Maths":    ["Multiplication Tables 2–5", "Division (Basic)", "Fractions (Half, Quarter)"],
  "SK-Term 3-2nd-Maths":    ["Time and Calendar", "Money", "Data Handling (Tally Charts)"],
  "SK-Term 1-2nd-EVS/Science": ["Food", "Water", "Air"],
  "SK-Term 2-2nd-EVS/Science": ["Plants (Photosynthesis)", "Animals (Adaptation)", "Soil"],
  "SK-Term 3-2nd-EVS/Science": ["Weather", "Simple Machines", "Light and Sound"],
  "SK-Term 1-2nd-Social Studies": ["Our Country India", "Our State Tamil Nadu", "National Symbols"],
  "SK-Term 2-2nd-Social Studies": ["Landforms", "Rivers of India", "Crops and Farming"],
  "SK-Term 3-2nd-Social Studies": ["Transport", "Occupations", "Government (intro)"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 3
  // ══════════════════════════════════════════════════════
  "SK-Term 1-3rd-Tamil":    ["நிலா (கவிதை)", "செய்யுள்", "பாடல் – நம் தமிழ்"],
  "SK-Term 2-3rd-Tamil":    ["உரைநடை", "பெயர்ச்சொல் வகைகள்", "வினைமுற்று"],
  "SK-Term 3-3rd-Tamil":    ["புணர்ச்சி", "மடக்கு அணி", "தொகைச்சொல்"],
  "SK-Term 1-3rd-English":  ["Animals", "Flowers and Plants", "Community Helpers"],
  "SK-Term 2-3rd-English":  ["Seasons and Weather", "Tenses (Simple)", "Letter Writing (Informal)"],
  "SK-Term 3-3rd-English":  ["Comprehension Passage", "Adjectives", "Essay (My School)"],
  "SK-Term 1-3rd-Maths":    ["4-Digit Numbers", "Multiplication (3-Digit x 1)", "Division"],
  "SK-Term 2-3rd-Maths":    ["Fractions", "Decimals (intro)", "Geometry (Angles)"],
  "SK-Term 3-3rd-Maths":    ["Area and Perimeter", "Time and Distance", "Data Handling"],
  "SK-Term 1-3rd-EVS/Science": ["Plants and their Parts", "Adaptation in Animals", "Soil and Rocks"],
  "SK-Term 2-3rd-EVS/Science": ["Food Chain", "Water Cycle", "Air Pressure"],
  "SK-Term 3-3rd-EVS/Science": ["Human Body", "Force and Motion", "Light and Shadow"],
  "SK-Term 1-3rd-Social Studies": ["Maps and Directions", "Physical Features of India", "Our State Tamil Nadu"],
  "SK-Term 2-3rd-Social Studies": ["Climate", "Agriculture of India", "Industries"],
  "SK-Term 3-3rd-Social Studies": ["Transport and Communication", "Our Government", "Environmental Care"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 4
  // ══════════════════════════════════════════════════════
  "SK-Term 1-4th-Tamil":    ["இயற்கை (கவிதை)", "உரைநடை", "தமிழ் இலக்கணம்"],
  "SK-Term 2-4th-Tamil":    ["வீரமாமுனிவர்", "செய்யுள்", "பாரதியார் பாடல்"],
  "SK-Term 3-4th-Tamil":    ["திருக்குறள்", "அன்றாட வாழ்வில் தமிழ்", "மரபுவழி சொற்கள்"],
  "SK-Term 1-4th-English":  ["Environment", "Alice in Wonderland (excerpts)", "Active and Passive Voice"],
  "SK-Term 2-4th-English":  ["Space", "Direct and Indirect Speech", "Paragraph Writing"],
  "SK-Term 3-4th-English":  ["Famous Personalities", "Prepositions", "Essay Writing"],
  "SK-Term 1-4th-Maths":    ["Large Numbers (Lakhs, Crores)", "Factors and Multiples (LCM, HCF)", "Fractions"],
  "SK-Term 2-4th-Maths":    ["Decimals", "Percentage (intro)", "Geometry – Angles"],
  "SK-Term 3-4th-Maths":    ["Area and Perimeter", "Volume", "Data Handling – Bar Graphs"],
  "SK-Term 1-4th-EVS/Science": ["Human Body – Organ Systems", "Food Chain", "Rocks and Minerals"],
  "SK-Term 2-4th-EVS/Science": ["Reproduction in Plants", "Solar System", "Force and Pressure"],
  "SK-Term 3-4th-EVS/Science": ["Light (Reflection)", "Sound", "Electricity (intro)"],
  "SK-Term 1-4th-Social Studies": ["Physical Features of India", "Climate Zones", "Soils and Vegetation"],
  "SK-Term 2-4th-Social Studies": ["Agriculture", "Industries", "Transport and Trade"],
  "SK-Term 3-4th-Social Studies": ["Our Constitution (intro)", "Human Rights", "World Continents"],

  // ══════════════════════════════════════════════════════
  // SAMACHEER KALVI — CLASS 5
  // ══════════════════════════════════════════════════════
  "SK-Term 1-5th-Tamil":    ["வீரமாமுனிவர்", "பாரதியார் கவிதை", "திருக்குறள் (அதிகாரம் 1–5)"],
  "SK-Term 2-5th-Tamil":    ["ஔவையார் பாடல்கள்", "உரைநடை", "இலக்கணம் – சொல் வகைகள்"],
  "SK-Term 3-5th-Tamil":    ["திருவாசகம்", "நவீன கவிதை", "தமிழ் இலக்கண – தொடர்"],
  "SK-Term 1-5th-English":  ["Famous Personalities", "Clauses and Phrases", "Essay Writing"],
  "SK-Term 2-5th-English":  ["Environment and Conservation", "Reported Speech", "Formal Letter"],
  "SK-Term 3-5th-English":  ["Technology and Science", "Idioms and Proverbs", "Story Writing"],
  "SK-Term 1-5th-Maths":    ["LCM and HCF", "Ratio and Proportion", "Percentage"],
  "SK-Term 2-5th-Maths":    ["Profit and Loss", "Simple Interest", "Algebra (intro)"],
  "SK-Term 3-5th-Maths":    ["Geometry (Quadrilaterals)", "Data Handling – Pie Charts", "Patterns"],
  "SK-Term 1-5th-EVS/Science": ["Reproduction in Plants and Animals", "Human Digestive System", "Ecosystems"],
  "SK-Term 2-5th-EVS/Science": ["Electricity and Circuits", "Light (Lenses)", "Matter (States)"],
  "SK-Term 3-5th-EVS/Science": ["Environment and Conservation", "Space", "Technology in Daily Life"],
  "SK-Term 1-5th-Social Studies": ["Ancient Civilizations", "Indian Constitution", "Natural Resources"],
  "SK-Term 2-5th-Social Studies": ["Freedom Struggle of India", "Five Year Plans", "World Geography"],
  "SK-Term 3-5th-Social Studies": ["Human Rights and Democracy", "Global Warming", "United Nations"],

  // Pre-KG Samacheer
  "SK-Term 1-Pre-KG-Tamil":    ["அ, ஆ", "பழங்கள்", "விலங்குகள்"],
  "SK-Term 2-Pre-KG-Tamil":    ["இ, ஈ, உ", "பூக்கள்", "வண்ணங்கள்"],
  "SK-Term 3-Pre-KG-Tamil":    ["ஊ, எ, ஏ", "வீட்டு பொருட்கள்", "என் குடும்பம்"],
  "SK-Term 1-Pre-KG-English":  ["A B C", "Colours", "Animals"],
  "SK-Term 2-Pre-KG-English":  ["D E F", "Fruits", "My Body"],
  "SK-Term 3-Pre-KG-English":  ["G H I J", "My Home", "Shapes"],
  "SK-Term 1-Pre-KG-Maths":    ["Numbers 1–3", "Shapes", "Big and Small"],
  "SK-Term 2-Pre-KG-Maths":    ["Numbers 4–7", "Tall and Short", "Patterns"],
  "SK-Term 3-Pre-KG-Maths":    ["Numbers 8–10", "Inside and Outside", "Counting"],
  "SK-Term 1-Pre-KG-EVS/Science": ["My Senses", "My Body", "My Family"],
  "SK-Term 2-Pre-KG-EVS/Science": ["Animals Around Me", "Plants", "Food I Eat"],
  "SK-Term 3-Pre-KG-EVS/Science": ["Water", "Air", "Clean Habits"],
};

// ─── Diagram SVG Component ─────────────────────────────────────────────────

function DiagramBox({ topic, labels }: { topic: string; labels?: string[] }) {
  const lower = topic.toLowerCase();
  const isPlant = ["plant", "flower", "தாவரம்", "செடி", "மரம்", "பூ"].some((k) => lower.includes(k));
  const isBody = ["body", "human", "உடல்", "மனித"].some((k) => lower.includes(k));
  const isSolar = ["solar", "planet", "சூரிய", "கோள்"].some((k) => lower.includes(k));
  const isWater = ["water cycle", "நீர் சுழற்சி", "rain", "cloud"].some((k) => lower.includes(k));

  return (
    <div className="border-2 border-dashed border-gray-300 print:border-gray-500 rounded-xl p-4 bg-gray-50 print:bg-transparent">
      <div className="flex flex-col items-center">
        {isPlant ? (
          <svg viewBox="0 0 300 280" className="w-64 h-56 mb-3" xmlns="http://www.w3.org/2000/svg">
            {/* Stem */}
            <line x1="150" y1="260" x2="150" y2="120" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
            {/* Roots */}
            <line x1="150" y1="260" x2="100" y2="285" stroke="#92400e" strokeWidth="3" />
            <line x1="150" y1="260" x2="130" y2="285" stroke="#92400e" strokeWidth="3" />
            <line x1="150" y1="260" x2="165" y2="285" stroke="#92400e" strokeWidth="3" />
            <line x1="150" y1="260" x2="190" y2="280" stroke="#92400e" strokeWidth="3" />
            {/* Left leaf */}
            <ellipse cx="105" cy="170" rx="35" ry="18" fill="#86efac" stroke="#22c55e" strokeWidth="1.5" transform="rotate(-30 105 170)" />
            <line x1="150" y1="180" x2="105" y2="170" stroke="#4ade80" strokeWidth="2" />
            {/* Right leaf */}
            <ellipse cx="195" cy="160" rx="35" ry="18" fill="#86efac" stroke="#22c55e" strokeWidth="1.5" transform="rotate(30 195 160)" />
            <line x1="150" y1="165" x2="195" y2="160" stroke="#4ade80" strokeWidth="2" />
            {/* Flower */}
            <circle cx="150" cy="110" r="22" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="150" cy="110" r="10" fill="#f59e0b" />
            {[0,60,120,180,240,300].map((angle, i) => (
              <ellipse key={i} cx={150 + 22 * Math.cos((angle * Math.PI) / 180)} cy={110 + 22 * Math.sin((angle * Math.PI) / 180)} rx="10" ry="6" fill="#fca5a5" transform={`rotate(${angle} ${150 + 22 * Math.cos((angle * Math.PI) / 180)} ${110 + 22 * Math.sin((angle * Math.PI) / 180)})`} />
            ))}
            {/* Soil */}
            <rect x="80" y="268" width="140" height="8" rx="4" fill="#a16207" />
            {/* Labels */}
            <text x="15" y="115" fontSize="11" fill="#166534" fontWeight="bold">Flower/பூ</text>
            <text x="55" y="140" fontSize="11" fill="#166534">Leaf/இலை</text>
            <text x="165" y="200" fontSize="11" fill="#166534">Stem/தண்டு</text>
            <text x="165" y="240" fontSize="11" fill="#166534">Root/வேர்</text>
            {/* Arrows */}
            <line x1="70" y1="112" x2="128" y2="110" stroke="#15803d" strokeWidth="1" markerEnd="url(#arr)" />
            <line x1="108" y1="136" x2="125" y2="155" stroke="#15803d" strokeWidth="1" />
            <line x1="163" y1="195" x2="153" y2="175" stroke="#15803d" strokeWidth="1" />
            <line x1="163" y1="237" x2="153" y2="250" stroke="#15803d" strokeWidth="1" />
          </svg>
        ) : isBody ? (
          <svg viewBox="0 0 200 260" className="w-48 h-56 mb-3" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="35" r="28" fill="#fde8d0" stroke="#d1a07a" strokeWidth="2" />
            <rect x="70" y="65" width="60" height="80" rx="8" fill="#fde8d0" stroke="#d1a07a" strokeWidth="2" />
            <line x1="70" y1="75" x2="35" y2="140" stroke="#d1a07a" strokeWidth="10" strokeLinecap="round" />
            <line x1="130" y1="75" x2="165" y2="140" stroke="#d1a07a" strokeWidth="10" strokeLinecap="round" />
            <line x1="85" y1="145" x2="75" y2="220" stroke="#d1a07a" strokeWidth="12" strokeLinecap="round" />
            <line x1="115" y1="145" x2="125" y2="220" stroke="#d1a07a" strokeWidth="12" strokeLinecap="round" />
            <text x="115" y="30" fontSize="9" fill="#1e3a5f" fontWeight="bold">Head/தலை</text>
            <text x="135" y="105" fontSize="9" fill="#1e3a5f">Arm/கை</text>
            <text x="135" y="190" fontSize="9" fill="#1e3a5f">Leg/கால்</text>
            <text x="5" y="105" fontSize="9" fill="#1e3a5f">Arm</text>
          </svg>
        ) : isSolar ? (
          <svg viewBox="0 0 320 200" className="w-72 h-44 mb-3" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="100" r="28" fill="#fbbf24" />
            <text x="35" y="140" fontSize="9" fill="#92400e" fontWeight="bold">Sun/சூரியன்</text>
            {[
              { cx: 100, cy: 100, r: 6, fill: "#a78bfa", name: "Mercury" },
              { cx: 128, cy: 100, r: 8, fill: "#60a5fa", name: "Venus" },
              { cx: 160, cy: 100, r: 10, fill: "#34d399", name: "Earth" },
              { cx: 196, cy: 100, r: 7, fill: "#f87171", name: "Mars" },
              { cx: 232, cy: 100, r: 14, fill: "#fb923c", name: "Jupiter" },
              { cx: 272, cy: 100, r: 11, fill: "#facc15", name: "Saturn" },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} />
                <text x={p.cx - 12} y={p.cy + p.r + 14} fontSize="7" fill="#1e3a5f">{p.name}</text>
              </g>
            ))}
          </svg>
        ) : isWater ? (
          <svg viewBox="0 0 300 200" className="w-64 h-44 mb-3" xmlns="http://www.w3.org/2000/svg">
            {/* Sun */}
            <circle cx="260" cy="40" r="22" fill="#fbbf24" />
            {/* Cloud */}
            <ellipse cx="100" cy="50" rx="50" ry="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="70" cy="58" rx="30" ry="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="130" cy="58" rx="30" ry="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Rain */}
            {[85,100,115,130].map((x, i) => (
              <line key={i} x1={x} y1="75" x2={x - 5} y2="95" stroke="#3b82f6" strokeWidth="2" />
            ))}
            {/* Water body */}
            <ellipse cx="150" cy="180" rx="120" ry="18" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Evaporation arrows */}
            <path d="M 160 162 Q 200 130 230 80" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="5,4" />
            <text x="205" y="115" fontSize="9" fill="#d97706" fontWeight="bold">Evaporation</text>
            <text x="58" y="45" fontSize="9" fill="#475569" fontWeight="bold">Cloud</text>
            <text x="70" y="100" fontSize="9" fill="#1d4ed8">Rain</text>
            <text x="100" y="176" fontSize="9" fill="#1d4ed8">Water Body</text>
          </svg>
        ) : (
          /* Generic blank diagram box */
          <div className="w-64 h-44 border-2 border-gray-300 print:border-gray-600 rounded-lg bg-white flex items-center justify-center mb-3">
            <div className="text-center text-gray-400">
              <PenLine className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Draw your diagram here</p>
              <p className="text-xs tamil-font opacity-60">இங்கே படம் வரைக</p>
            </div>
          </div>
        )}

        {/* Label lines for students to fill */}
        <div className="w-full grid grid-cols-2 gap-3 mt-2">
          {(labels && labels.length > 0 ? labels : ["Label 1", "Label 2", "Label 3", "Label 4"]).map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 w-5">{i + 1}.</span>
              <div className="flex-1 border-b-2 border-dashed border-gray-400 print:border-gray-600 h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorksheetMaker() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData_>({
    curriculum: "Samacheer Kalvi (Tamil Nadu State Board)",
    term: "Term 1",
    grade: "3rd",
    subject: "Maths",
    topic: "",
    numQuestions: 10,
    language: "English",
    difficulty: "Medium",
    questionTypes: [],
  });
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savedList, setSavedList] = useState<SavedWorksheet[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [showSaved, setShowSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Update topic suggestions when grade/subject changes
  useEffect(() => {
    const isMB = formData.curriculum === "Oxford Merry Birds (Integrated Term Course)";
    const curricShort = isMB ? "MB" : "SK";
    const key = `${curricShort}-${formData.term}-${formData.grade}-${formData.subject}`;
    setSuggestions(TOPIC_SUGGESTIONS_MAP[key] || []);
  }, [formData.curriculum, formData.term, formData.grade, formData.subject]);

  // ─── Generate ──────────────────────────────────────────────────────────────

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

  // ─── Local Save (IndexedDB-backed via localStorage for simplicity) ─────────

  const saveWorksheet = () => {
    if (!worksheet) return;
    const saved: SavedWorksheet = {
      id: Date.now().toString(),
      title: worksheet.title,
      savedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      worksheet,
      formData,
    };
    const updated = [saved, ...savedList].slice(0, 30);
    setSavedList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast({ title: "Saved locally! 💾", description: "Accessible anytime, even offline." });
    } catch {
      toast({ title: "Storage full", description: "Please delete some saved worksheets first.", variant: "destructive" });
    }
  };

  const deleteSaved = (id: string) => {
    const updated = savedList.filter((w) => w.id !== id);
    setSavedList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const loadSaved = (saved: SavedWorksheet) => {
    setWorksheet(saved.worksheet);
    setFormData(saved.formData);
    setShowSaved(false);
    setShowAnswers(false);
    toast({ title: "Worksheet loaded!", description: saved.title });
  };

  // ─── Print / PDF / Word ────────────────────────────────────────────────────

  const handlePrint = () => {
    const prev = showAnswers;
    setShowAnswers(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowAnswers(prev), 500);
    }, 300);
  };

  const handleDownloadWord = () => {
    if (!worksheet) return;
    // Build a simple HTML string that Word can open as .doc
    const sections = worksheet.sections?.map((section) => {
      const qs = section.questions.map((q) => {
        if (section.type === "fill_in_blanks") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${(q.question || "").replace(/_{2,}|\[_+\]/g, "___________________________")}</p>`;
        }
        if (section.type === "multiple_choice") {
          const opts = (q.options || []).map((o, i) => `&nbsp;&nbsp;${String.fromCharCode(65+i)}) ${o}`).join("<br/>");
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question}</p><p style="margin-left:20px">${opts}</p>`;
        }
        if (section.type === "match_following") {
          const rows = (q.left || []).map((l, i) =>
            `<tr><td style="border:1px solid #ccc;padding:6px;width:50%">${i+1}. ${l}</td><td style="border:1px solid #ccc;padding:6px;width:50%">${String.fromCharCode(97+i)}. ${q.right?.[i] || ""}</td></tr>`
          ).join("");
          return `<table style="width:100%;border-collapse:collapse;margin:8px 0">${rows}</table>`;
        }
        if (section.type === "true_false") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question} &nbsp;&nbsp;[ True / False ]</p>`;
        }
        if (section.type === "short_answer") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question}</p><p style="border-bottom:1px solid #999;margin:4px 20px">&nbsp;</p><p style="border-bottom:1px solid #999;margin:4px 20px">&nbsp;</p>`;
        }
        if (section.type === "diagram") {
          return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question}</p><div style="border:2px dashed #aaa;width:80%;height:180px;margin:8px 0;display:flex;align-items:center;justify-content:center"><span style="color:#aaa">[ Draw here ]</span></div>`;
        }
        return `<p style="margin:8px 0"><b>${q.id}.</b> ${q.question || ""}</p>`;
      }).join("");
      return `<h3 style="background:#e0f2fe;padding:8px 12px;margin-top:20px;font-size:14px">${section.heading}</h3>${qs}`;
    }).join("") || "";

    const answerKey = showAnswers ? `
      <div style="page-break-before:always">
        <h2 style="color:#166534">Answer Key</h2>
        ${worksheet.sections?.map(s => `
          <p><b>${s.heading}</b></p>
          ${s.questions.filter(q=>q.answer).map(q =>
            s.type === "match_following"
              ? `<p>${q.id}. ${q.left?.map((l,i) => `${l} → ${q.answers?.[i]}`).join(" | ")}</p>`
              : `<p>${q.id}. ${q.answer}</p>`
          ).join("")}
        `).join("")}
      </div>` : "";

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${worksheet.title}</title>
      <style>
        body { font-family: 'Noto Sans Tamil', Arial, sans-serif; font-size: 13px; color: #111; margin: 40px; }
        h1 { font-size: 18px; text-align: center; color: #1a3a5c; }
        h2 { font-size: 15px; color: #1a3a5c; }
        h3 { font-size: 13px; }
        p { margin: 6px 0; }
        table { border-collapse: collapse; width: 100%; }
      </style>
      </head>
      <body>
        <h1>${worksheet.title}</h1>
        <p style="text-align:center;color:#555">${formData.curriculum} · ${formData.grade} · ${formData.subject} · ${formData.term}</p>
        <hr/>
        <p><b>Name:</b> _____________________________ &nbsp;&nbsp; <b>Date:</b> __________________ &nbsp;&nbsp; <b>Score:</b> ______ / ${formData.numQuestions}</p>
        <p style="background:#fffde7;padding:8px;border-left:4px solid #f59e0b"><b>Instructions:</b> ${worksheet.instructions}</p>
        ${sections}
        ${answerKey}
      </body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${worksheet.title.replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s]/g, "")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Word file downloaded! 📄", description: "Open with Microsoft Word or LibreOffice." });
  };

  // ─── Edit helpers ──────────────────────────────────────────────────────────

  const updateQuestion = (sIdx: number, qIdx: number, field: string, value: string) => {
    if (!worksheet) return;
    const updated = { ...worksheet };
    updated.sections = worksheet.sections.map((s, si) =>
      si === sIdx
        ? { ...s, questions: s.questions.map((q, qi) => qi === qIdx ? { ...q, [field]: value } : q) }
        : s
    );
    setWorksheet(updated);
  };

  // ─── Render section ────────────────────────────────────────────────────────

  const renderSection = (section: Section, sIdx: number) => {
    switch (section.type) {
      case "fill_in_blanks":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-5 ${gradeLineHeight}`}>
            <p className={`font-medium text-gray-800 print:text-black ${gradeFontSize} leading-[2.4]`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {editMode ? (
                <input className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
              ) : (
                <span dangerouslySetInnerHTML={{
                  __html: (q.question || "").replace(/_{2,}|\[_+\]/g, '<span class="inline-block border-b-2 border-gray-500 print:border-black min-w-[120px] mx-1 align-bottom">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>')
                }} />
              )}
            </p>
            {showAnswers && <p className="text-green-700 text-sm mt-1 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "multiple_choice":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-6 ${gradeLineHeight}`}>
            <p className={`font-medium text-gray-800 print:text-black mb-3 ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {editMode ? (
                <input className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
              ) : q.question}
            </p>
            <div className="grid grid-cols-2 gap-3 ml-6">
              {q.options?.map((opt, oi) => (
                <label key={oi} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-sm shrink-0 mt-0.5 print:border-black" />
                  <span className={`${gradeFontSize} text-gray-700 print:text-black tamil-font`}>{String.fromCharCode(65 + oi)}) {opt}</span>
                </label>
              ))}
            </div>
            {showAnswers && <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "match_following":
        return section.questions.map((q) => (
          <div key={q.id} className="mb-8">
            <div className="w-full border-2 border-gray-300 print:border-gray-600 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-2">
                <div className="bg-sky-100 print:bg-gray-100 border-r-2 border-gray-300 print:border-gray-600 px-5 py-2.5">
                  <p className="font-extrabold text-xs text-sky-700 print:text-gray-800 uppercase tracking-widest text-center">
                    Column A — கிடுக்கிகள்
                  </p>
                </div>
                <div className="bg-emerald-100 print:bg-gray-100 px-5 py-2.5">
                  <p className="font-extrabold text-xs text-emerald-700 print:text-gray-800 uppercase tracking-widest text-center">
                    Column B — பொருத்துக
                  </p>
                </div>
              </div>
              {/* Data rows */}
              {(q.left || []).map((item, i) => (
                <div key={i} className={`grid grid-cols-2 border-t-2 border-gray-200 print:border-gray-400 ${i % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-transparent"}`}>
                  <div className="flex items-center gap-3 border-r-2 border-gray-300 print:border-gray-600 px-5 py-3 min-h-[3rem]">
                    <span className="font-extrabold text-sky-600 print:text-gray-800 w-6 shrink-0 text-sm">{i + 1}.</span>
                    <span className={`${gradeFontSize} tamil-font text-gray-800 print:text-black flex-1 leading-snug`}>{item}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400 print:hidden">ans:</span>
                      <div className="w-10 h-6 border-b-2 border-dashed border-gray-400 print:border-gray-700" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 min-h-[3rem]">
                    <span className="font-extrabold text-emerald-600 print:text-gray-800 w-6 shrink-0 text-sm">{String.fromCharCode(97 + i)}.</span>
                    <span className={`${gradeFontSize} tamil-font text-gray-800 print:text-black flex-1 leading-snug`}>{q.right?.[i]}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1 italic print:hidden">Write the matching letter (a, b, c…) in the dashed box beside each item in Column A.</p>
            {showAnswers && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 print:bg-transparent print:border-green-700">
                <p className="text-green-700 text-sm font-semibold print:text-green-900 tamil-font">
                  ✓ Answers: {q.left?.map((l, i) => `${i + 1} → ${q.answers?.[i]}`).join("  |  ")}
                </p>
              </div>
            )}
          </div>
        ));

      case "short_answer":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-7 ${gradeLineHeight}`}>
            <p className={`font-medium text-gray-800 print:text-black mb-3 ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {editMode ? (
                <input className="border-b border-gray-400 outline-none w-full mt-1 bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
              ) : q.question}
            </p>
            <div className="ml-6 space-y-3">
              <div className="border-b-2 border-gray-300 h-8 print:border-gray-500" />
              <div className="border-b-2 border-gray-300 h-8 print:border-gray-500" />
              {["LKG","UKG","1st","2nd"].includes(formData.grade) && (
                <div className="border-b-2 border-gray-300 h-8 print:border-gray-500" />
              )}
            </div>
            {showAnswers && <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "true_false":
        return section.questions.map((q, qIdx) => (
          <div key={q.id} className={`mb-5 ${gradeLineHeight}`}>
            <div className={`flex items-start gap-3 font-medium text-gray-800 print:text-black ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold text-sky-700 print:text-black shrink-0">{q.id}.</span>
              <div className="flex-1">
                {editMode ? (
                  <input className="border-b border-gray-400 outline-none w-full bg-transparent tamil-font" value={q.question || ""} onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)} />
                ) : <span>{q.question}</span>}
                <div className="flex gap-6 mt-2 ml-1">
                  <label className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-sm print:border-black" />
                    <span className="font-semibold print:text-black">✓ True / சரி</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-sm print:border-black" />
                    <span className="font-semibold print:text-black">✗ False / தவறு</span>
                  </label>
                </div>
              </div>
            </div>
            {showAnswers && <p className="text-green-700 text-sm mt-1 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>}
          </div>
        ));

      case "diagram":
        return section.questions.map((q) => (
          <div key={q.id} className="mb-8">
            <p className={`font-medium text-gray-800 print:text-black mb-4 tamil-font ${gradeFontSize} leading-relaxed`}>
              <span className="font-bold mr-2 text-sky-700 print:text-black">{q.id}.</span>
              {q.question}
            </p>
            <div className="ml-4">
              {(() => {
                const lower = formData.topic.toLowerCase();
                const isKnown = ["plant","flower","தாவரம்","செடி","மரம்","பூ","body","human","உடல்","மனித","solar","planet","சூரிய","கோள்","water cycle","நீர் சுழற்சி","rain","cloud"].some(k => lower.includes(k));
                return isKnown ? (
                  <DiagramBox topic={formData.topic} labels={q.diagramLabels} />
                ) : (
                  <div className="border-2 border-dashed border-gray-400 print:border-gray-600 rounded-xl bg-gray-50 print:bg-white overflow-hidden">
                    <div className="w-full h-52 print:h-64 flex flex-col items-center justify-center text-gray-300 print:text-gray-400 gap-2 border-b-2 border-dashed border-gray-300 print:border-gray-500">
                      <PenLine className="h-12 w-12 opacity-30" />
                      <p className="text-base font-bold text-gray-400 print:text-gray-600">[ Draw here / இங்கே வரைக ]</p>
                      <p className="text-xs text-gray-300 print:text-gray-500 tamil-font">Draw and label the diagram in the box above</p>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Label the parts below / கீழே பாகங்களை எழுதுக:</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {(q.diagramLabels && q.diagramLabels.length > 0 ? q.diagramLabels : ["Part 1", "Part 2", "Part 3", "Part 4"]).map((lbl, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 w-5 shrink-0">{i + 1}.</span>
                            <div className="flex-1 border-b-2 border-dashed border-gray-400 print:border-gray-600 min-h-[1.5rem]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {showAnswers && q.answer && (
              <p className="text-green-700 text-sm mt-2 ml-6 print:text-green-900 font-semibold">✓ {q.answer}</p>
            )}
          </div>
        ));

      default:
        return null;
    }
  };

  const isTamil = formData.language === "Tamil";
  const fontClass = isTamil ? "tamil-font" : "";

  // Grade-based font size: lower grades get larger text for readability
  const gradeFontSize = (() => {
    if (["LKG", "UKG"].includes(formData.grade)) return "text-xl";
    if (["1st", "2nd"].includes(formData.grade)) return "text-lg";
    if (formData.grade === "3rd") return "text-base";
    return "text-sm";
  })();

  const gradeLineHeight = ["LKG", "UKG", "1st", "2nd"].includes(formData.grade) ? "leading-loose" : "leading-relaxed";

  // ─── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-blue-50 overflow-x-hidden ${fontClass}`}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif !important; }
          .worksheet-card { box-shadow: none !important; border: 1px solid #aaa !important; }
          @page { margin: 1.5cm; size: A4 portrait; }
        }
        .tamil-font, .tamil-font * { font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', 'Baloo 2', sans-serif !important; }
        ${isTamil ? `
          .worksheet-card, .worksheet-card * {
            font-family: 'Noto Sans Tamil', 'Noto Serif Tamil', 'Baloo 2', sans-serif !important;
          }
        ` : ""}
      `}</style>

      {/* ── Page Header ── */}
      <div className="no-print bg-gradient-to-r from-sky-600 to-emerald-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
              {"NethajiVidhyalayam Worksheet Maker"}
            </h1>
          </div>
          <p className="text-sky-100 text-sm md:text-base max-w-xl mx-auto tamil-font">
            {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
              ? "AI-powered worksheets · Oxford Merry Birds Integrated Term Course · LKG – 5th"
              : "AI-powered worksheets · Tamil Nadu Samacheer Kalvi · LKG – 5th Standard"}
          </p>
          <p className="text-sky-200 text-xs mt-1 tamil-font">
            {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
              ? "Joyful · Activity-based · Phonics & Stories"
              : "தமிழ்நாடு சமச்சீர் பாடத்திட்டம் · AI தொழில்நுட்பம்"}
          </p>
        </div>
      </div>

      {/* PWA Install Banner */}
      <div className="no-print max-w-4xl mx-auto px-4 pt-4">
        <PWAInstallBanner
          appName="Worksheet Maker"
          appEmoji="📄"
          appColor="from-sky-500 to-emerald-600"
          description="Generate worksheets offline • Save to home screen • No app store needed"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Form Card ── */}
        <div className="no-print bg-white rounded-2xl shadow-lg border border-sky-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
              Create Your Worksheet
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Curriculum / Board — full width, at top */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                📚 Curriculum / Board <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURRICULA.map((c) => {
                  const active = formData.curriculum === c;
                  const isMerry = c === "Oxford Merry Birds (Integrated Term Course)";
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const langUpdate = isMerry && formData.language === "Tamil" ? "English" : formData.language;
                        // Reset subject if it's not available in the new curriculum
                        const newSubjects = isMerry ? MERRY_BIRDS_SUBJECTS : SAMACHEER_SUBJECTS;
                        const subjectUpdate = newSubjects.includes(formData.subject) ? formData.subject : newSubjects[0];
                        setFormData({ ...formData, curriculum: c, language: langUpdate, subject: subjectUpdate });
                      }}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        active
                          ? "border-sky-500 bg-sky-50 shadow-sm"
                          : "border-gray-200 bg-gray-50 hover:border-sky-300 hover:bg-sky-50"
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{isMerry ? "🐦" : "📖"}</span>
                      <div>
                        <p className={`text-sm font-bold leading-tight ${active ? "text-sky-700" : "text-gray-700"}`}>
                          {isMerry ? "Oxford Merry Birds" : "Samacheer Kalvi"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isMerry ? "Integrated Term Course · OUP" : "Tamil Nadu State Board"}
                        </p>
                      </div>
                      {active && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[11px] font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)" && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  🐦 <strong>Merry Birds tip:</strong> English is the primary language for this series. Phonics, rhymes, stories, and activity-based questions will be prioritized.
                </p>
              )}
            </div>

            {/* Term */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Term / தவணை</Label>
              <div className="flex gap-2">
                {TERMS.map((t) => (
                  <button key={t} type="button" onClick={() => setFormData({ ...formData, term: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${formData.term === t ? "border-sky-500 bg-sky-500 text-white shadow-sm" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Grade / Class</Label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 transition" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Subject / பாடம்</Label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 transition tamil-font" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                {(formData.curriculum === "Oxford Merry Birds (Integrated Term Course)" ? MERRY_BIRDS_SUBJECTS : SAMACHEER_SUBJECTS).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Topic / Chapter — <span className="tamil-font text-sky-600">தலைப்பு / பாடம்</span>
              </Label>
              <Input
                placeholder={isTamil ? "உதாரணம்: எழுத்துக்கள், தாவரங்கள், கூட்டல்..." : "e.g. Addition, Parts of plant, எழுத்துக்கள்..."}
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="tamil-font bg-sky-50 border-gray-200 focus:ring-sky-400 text-base"
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
              {/* Curriculum-aware topic note */}
              <p className="text-xs text-gray-500 mt-1.5 italic">
                {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                  ? `💡 Enter topic/chapter name from your Merry Birds book (e.g., "The Little Red Hen" for stories, "Phonics - Short 'a'" for phonics, "My Family" for EVS).`
                  : `💡 Enter topic/chapter name from your book (e.g., "Addition" for Maths, "Parts of Plant" for EVS, "எழுத்துக்கள்" for Tamil).`}
              </p>
              {/* Topic suggestions */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => setFormData({ ...formData, topic: s })}
                      className="text-xs px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full border border-sky-200 hover:bg-sky-200 transition tamil-font">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Number of Questions */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Questions: <span className="text-sky-600 font-extrabold">{formData.numQuestions}</span>
              </Label>
              <input type="range" min={5} max={20} value={formData.numQuestions}
                onChange={(e) => setFormData({ ...formData, numQuestions: Number(e.target.value) })}
                className="w-full accent-sky-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>

            {/* Language */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Language / மொழி</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} onClick={() => setFormData({ ...formData, language: l })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all tamil-font ${formData.language === l ? "border-sky-500 bg-sky-500 text-white shadow-sm" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300"}`}>
                    {l === "Tamil" ? "தமிழ்" : l === "Bilingual" ? "இரு மொழி" : l}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">Difficulty / நிலை</Label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => {
                  const active: Record<string, string> = { Easy: "border-emerald-500 bg-emerald-500", Medium: "border-amber-500 bg-amber-500", Hard: "border-red-500 bg-red-500" };
                  const hover: Record<string, string> = { Easy: "hover:border-emerald-400", Medium: "hover:border-amber-400", Hard: "hover:border-red-400" };
                  const emoji: Record<string, string> = { Easy: "🟢", Medium: "🟡", Hard: "🔴" };
                  return (
                    <button key={d} onClick={() => setFormData({ ...formData, difficulty: d })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${formData.difficulty === d ? `${active[d]} text-white shadow-sm` : `border-gray-200 bg-gray-50 text-gray-600 ${hover[d]}`}`}>
                      {emoji[d]} {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Types multi-select */}
            <div className="md:col-span-2">
              <Label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Question Types <span className="text-gray-400 font-normal">(optional — leave blank for balanced mix)</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUESTION_TYPES.map((qt) => {
                  const selected = formData.questionTypes.includes(qt.id);
                  return (
                    <button
                      key={qt.id}
                      type="button"
                      onClick={() => {
                        const types = selected
                          ? formData.questionTypes.filter((t) => t !== qt.id)
                          : [...formData.questionTypes, qt.id];
                        setFormData({ ...formData, questionTypes: types });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        selected
                          ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300 hover:bg-sky-50"
                      }`}
                    >
                      <span className="text-base">{qt.emoji}</span>
                      <div className="min-w-0">
                        <div className="leading-tight">{qt.label}</div>
                        <div className="text-xs text-gray-400 tamil-font leading-tight">{qt.tamil}</div>
                      </div>
                      {selected && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {formData.questionTypes.length > 0 ? (
                <p className="text-xs text-sky-600 mt-1.5 font-medium">
                  Selected: {formData.questionTypes.map(id => QUESTION_TYPES.find(q => q.id === id)?.label).join(", ")}
                </p>
              ) : formData.curriculum === "Oxford Merry Birds (Integrated Term Course)" ? (
                <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 font-semibold">🐦 Merry Birds auto-mix (when none selected):</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    ✏️ Fill Missing Sounds/Letters &nbsp;·&nbsp; 🔗 Match Rhyming Words &nbsp;·&nbsp; 🔘 Story MCQ &nbsp;·&nbsp; ✅ Phonics True/False &nbsp;·&nbsp; 🖊️ Draw & Colour
                  </p>
                </div>
              ) : null}

            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generate} disabled={loading}
            className="w-full mt-6 h-14 text-lg font-bold bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" />AI generating worksheet…</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" />Generate Worksheet · தாள் உருவாக்கு</>
            )}
          </Button>

          {/* Saved list toggle */}
          {savedList.length > 0 && (
            <button onClick={() => setShowSaved(!showSaved)}
              className="mt-3 w-full text-sm text-sky-600 hover:text-sky-800 font-semibold flex items-center justify-center gap-1.5 transition-colors">
              <List className="h-4 w-4" />
              {showSaved ? "Hide" : "View"} My Saved Worksheets ({savedList.length}/30)
            </button>
          )}

          {/* Saved worksheets list */}
          {showSaved && (
            <div className="mt-4 border border-sky-100 rounded-xl overflow-hidden">
              {savedList.map((sw) => (
                <div key={sw.id} className="flex items-center justify-between px-4 py-3 border-b border-sky-50 last:border-0 hover:bg-sky-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-800 truncate tamil-font">{sw.title}</p>
                    <p className="text-xs text-gray-400">{sw.savedAt} · {sw.formData.grade} {sw.formData.subject}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => loadSaved(sw)} className="text-xs h-7">Load</Button>
                    <button onClick={() => deleteSaved(sw.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                <p className="text-gray-400 text-sm mt-1 tamil-font">தாள் உருவாக்கப்படுகிறது… AI Samacheer Kalvi பாடத்திட்டத்தை பின்பற்றுகிறது</p>
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
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline" className="gap-2 border-gray-300">
                {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAnswers ? "Hide Answers" : "Answer Key"}
              </Button>
              <Button onClick={() => setEditMode(!editMode)} variant="outline"
                className={`gap-2 ${editMode ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-300"}`}>
                <FileText className="h-4 w-4" />
                {editMode ? "Done Editing" : "Edit"}
              </Button>
              <Button onClick={saveWorksheet} variant="outline" className="gap-2 border-gray-300">
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button onClick={generate} variant="outline" className="gap-2 border-gray-300">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              {/* Download dropdown */}
              <div className="relative group ml-auto">
                <Button className="gap-2 bg-sky-600 hover:bg-sky-700 text-white pr-3">
                  <Download className="h-4 w-4" /> Download <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 hidden group-hover:block min-w-[180px] overflow-hidden">
                  <button onClick={handlePrint}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors border-b border-gray-100">
                    <Printer className="h-4 w-4 text-sky-500" />
                    <div className="text-left">
                      <div className="font-semibold">Save as PDF</div>
                      <div className="text-xs text-gray-400">Print → Save as PDF</div>
                    </div>
                  </button>
                  <button onClick={handleDownloadWord}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div className="text-left">
                      <div className="font-semibold">Save as Word</div>
                      <div className="text-xs text-gray-400">Open in Word / LibreOffice</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Worksheet document */}
            <div className="worksheet-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" id="worksheet">
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-emerald-600 print:bg-none print:border-b-4 print:border-sky-700 text-white print:text-black px-8 py-6 print:py-4">
                <div className="text-center">
                  <p className="text-xs text-sky-200 print:text-gray-600 mb-1 font-semibold">
                    {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                      ? "Oxford Merry Birds • Integrated Term Course • OUP"
                      : "Tamil Nadu Samacheer Kalvi • தமிழ்நாடு சமச்சீர் கல்வி"}
                  </p>
                  <h2 className={`tamil-font text-xl md:text-2xl font-extrabold leading-snug print:text-black`}
                    style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', serif" }}>
                    {worksheet.title}
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-2 flex-wrap text-sm">
                    {[worksheet.grade, worksheet.subject, formData.difficulty, formData.language].map((tag) => (
                      <span key={tag} className="bg-white/20 print:bg-transparent print:border print:border-gray-500 print:text-gray-700 text-white rounded-full px-3 py-0.5 font-semibold">{tag}</span>
                    ))}
                    {worksheet._hasDiagram && (
                      <span className="bg-amber-400/40 print:bg-transparent print:border print:border-amber-600 print:text-amber-800 text-white rounded-full px-3 py-0.5 font-semibold">
                        📐 Includes Diagram
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student info strip */}
              <div className="bg-sky-50 print:bg-transparent border-b border-sky-100 px-8 py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="text-gray-600 tamil-font">பெயர் / Name: <span className="inline-block w-48 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Date: <span className="inline-block w-28 border-b border-gray-500 ml-1" /></span>
                  <span className="text-gray-600">Score: <span className="inline-block w-20 border-b border-gray-500 ml-1" /> / {formData.numQuestions}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="px-8 py-4 bg-amber-50 print:bg-transparent border-b border-amber-100">
                <p className={`tamil-font text-sm text-amber-800 print:text-gray-800 font-medium leading-relaxed`}>
                  📋 <strong>Instructions / வழிமுறைகள்:</strong> {worksheet.instructions}
                </p>
              </div>

              {/* Sections */}
              <div className={`px-8 py-6 space-y-10 ${isTamil ? "tamil-font" : ""}`}>
                {worksheet.sections?.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h3 className="tamil-font font-bold text-gray-900 text-base border-b-2 border-sky-200 print:border-gray-500 pb-2 mb-5 flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
                      {section.type === "fill_in_blanks" && <PenLine className="h-4 w-4 text-sky-500 print:hidden" />}
                      {section.type === "multiple_choice" && <CheckSquare className="h-4 w-4 text-emerald-500 print:hidden" />}
                      {section.type === "diagram" && <span className="print:hidden">📐</span>}
                      {section.heading}
                    </h3>
                    <div className={`${isTamil ? "tamil-font" : ""} space-y-1`}>
                      {renderSection(section, sIdx)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Answer Key */}
              {showAnswers && (
                <div className="mx-8 mb-8 p-5 bg-green-50 print:bg-transparent border-2 border-green-200 print:border-green-700 rounded-xl">
                  <h3 className="font-bold text-green-800 print:text-green-900 text-base mb-4"
                    style={{ fontFamily: "'Baloo 2', 'Noto Sans Tamil', sans-serif" }}>
                    ✅ Answer Key / விடை திறவு
                  </h3>
                  <div className="space-y-4">
                    {worksheet.sections?.map((section, sIdx) => (
                      <div key={sIdx}>
                        <p className="text-xs font-bold text-green-700 print:text-green-900 uppercase tracking-wider mb-2 tamil-font">{section.heading}</p>
                        <div className="tamil-font grid grid-cols-1 md:grid-cols-2 gap-2">
                          {section.questions.filter(q => q.answer).map((q) => (
                            <p key={q.id} className="text-sm text-green-800 print:text-black leading-relaxed">
                              <strong>{q.id}.</strong>{" "}
                              {section.type === "match_following"
                                ? q.left?.map((l, i) => `${l} → ${q.answers?.[i]}`).join(" | ")
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
                <p className="text-xs text-gray-400 print:text-gray-600 tamil-font">
                  {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                    ? "Oxford Merry Birds • Integrated Term Course (Pre-KG to 5th) • OUP"
                    : "Tamil Nadu Samacheer Kalvi Curriculum (Pre-KG to 5th)"} • Generated by Worksheet Maker • Nethaji Vidhyalayam
                </p>
                <p className="text-xs text-gray-300 print:text-gray-500 mt-0.5 tamil-font">
                  {formData.curriculum === "Oxford Merry Birds (Integrated Term Course)"
                    ? `${formData.term} • Class ${formData.grade} • ${formData.subject}`
                    : "தமிழ்நாடு சமச்சீர் பாடத்திட்டம் • AI தொழில்நுட்பத்தால் உருவாக்கப்பட்டது"}
                  தமிழ்நாடு சமச்சீர் பாடத்திட்டம் • AI தொழில்நுட்பத்தால் உருவாக்கப்பட்டது
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
