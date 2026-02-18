import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Topics that benefit from diagram/drawing sections
const DIAGRAM_TOPICS = [
  "plant", "parts of plant", "flower", "leaf", "root", "stem", "seed",
  "human body", "body parts", "skeleton", "eye", "ear", "heart", "lung",
  "digestive", "food chain", "ecosystem", "habitat",
  "solar system", "planets", "earth", "moon", "sun",
  "water cycle", "rain", "cloud", "evaporation",
  "animals", "insects", "birds", "fish", "mammals",
  "triangle", "circle", "square", "rectangle", "shapes", "geometry",
  "map", "direction", "compass",
  "செடி", "தாவரம்", "மரம்", "பூ", "இலை", "வேர்", "விதை",
  "மனித உடல்", "கண்", "காது", "உடல் உறுப்பு",
  "சூரிய மண்டலம்", "கோள்கள்", "பூமி",
  "நீர் சுழற்சி", "மேகம்",
  "விலங்குகள்", "பறவைகள்", "மீன்",
];

function needsDiagram(topic: string): boolean {
  const lower = topic.toLowerCase();
  return DIAGRAM_TOPICS.some((kw) => lower.includes(kw.toLowerCase()));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { curriculum, term, grade, subject, topic, numQuestions, language, difficulty, questionTypes } = await req.json();
    const isMerryBirds = curriculum === "Oxford Merry Birds (Integrated Term Course)";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const hasDiagram = needsDiagram(topic);

    const langInstruction =
      language === "Tamil"
        ? "Write ALL questions, answers, instructions, and headings in Tamil script (தமிழில் எழுதவும்). Use proper Tamil grammar. Do not use English at all."
        : language === "Bilingual"
        ? "Write each question in English first, then Tamil translation in parentheses. Format: 'English question (தமிழ் மொழிபெயர்ப்பு)'. Section headings also bilingual."
        : "Write all content in clear, simple English appropriate for the grade level.";

    const difficultyGuide =
      difficulty === "Easy"
        ? "Use simple, direct questions. Focus on recognition, recall, and single-word answers. Very simple vocabulary."
        : difficulty === "Hard"
        ? "Include analytical, application-based questions requiring reasoning, 2-3 sentence answers, and real-world connections."
        : "Balanced mix: some recall questions, some application questions, moderate vocabulary.";

    const diagramSection = hasDiagram ? `
    {
      "type": "diagram",
      "heading": "${language === "Tamil" ? "பிரிவு E: படம் வரைந்து பெயரிடுக" : language === "Bilingual" ? "Section E: Draw and Label (படம் வரைந்து பெயரிடுக)" : "Section E: Draw and Label"}",
      "questions": [
        {
          "id": 99,
          "question": "${language === "Tamil" ? `${topic} பற்றிய படம் வரைந்து முக்கிய பாகங்களை பெயரிடுக` : language === "Bilingual" ? `Draw a diagram of ${topic} and label its main parts (${topic} பற்றிய படம் வரைந்து பாகங்களை பெயரிடுக)` : `Draw a neat diagram of ${topic} and label its main parts`}",
          "answer": "See diagram — label the key parts as taught in class",
          "diagramLabels": ["Part 1", "Part 2", "Part 3", "Part 4"]
        }
      ]
    },` : "";

    const systemPrompt = isMerryBirds
      ? `You are an expert educational content creator specializing in the Oxford Merry Birds series for Pre-KG to 5th Standard (Integrated Term Course by Oxford University Press India). You have:
- Complete knowledge of Oxford Merry Birds textbooks for Pre-KG, LKG, UKG, and Classes 1–5 across all subjects
- Subjects covered: English, Maths, EVS/Science, Social Studies, General Knowledge — each with Term 1, Term 2, Term 3 books
- Expertise in activity-based, joyful, child-friendly approaches: phonics, stories, rhymes, poems, basic grammar
- For English: phonics (short vowels, blends, CVC words), a/an/the, nouns, verbs, adjectives, letter/story writing
- For Maths: numbers, shapes, addition, subtraction, multiplication, division, fractions, time, money, geometry
- For EVS/Science: plants, animals, food, water, air, human body, seasons, simple machines, solar system
- For Social Studies: my home/school, maps, India, Tamil Nadu, landforms, transport, government
- For General Knowledge: national symbols, famous personalities, inventions, space, sports, world capitals
- Pre-KG/LKG/UKG content focuses on recognition, matching, coloring, simple phonics, numbers 1–20
- Classes 1–5 content progressively deepens concepts each term

Your worksheets are:
✓ 100% Oxford Merry Birds Integrated Term Course aligned (Pre-KG to 5th)
✓ Joyful, activity-based, and encouraging with age-appropriate language
✓ Print-ready with clear formatting and visual-friendly questions
✓ Rich with phonics, rhymes, poems, and skill-building activities`
      : `You are an expert educational content creator with 20+ years of experience in Tamil Nadu Samacheer Kalvi curriculum for Pre-KG to 5th Standard. You have:
- Complete knowledge of Samacheer Kalvi textbooks for Pre-KG, LKG, UKG, and Classes 1–5
- Subjects covered: Tamil, English, Maths, EVS/Science, Social Studies — each with Term 1, Term 2, Term 3 portions
- Expertise in Tamil language education: உயிர் எழுத்துக்கள், மெய் எழுத்துக்கள், உயிர்மெய், இலக்கணம், செய்யுள்
- For Maths: numbers, operations, geometry, fractions, decimals, data handling as per Samacheer syllabus
- For EVS/Science: plants, animals, human body, food chain, water cycle, solar system per Samacheer textbooks
- For Social Studies: maps, India, Tamil Nadu, landforms, rivers, occupations, government, world geography
- Deep understanding of child psychology and age-appropriate learning
- Bilingual (Tamil-English) content creation skills

Your worksheets are:
✓ 100% Samacheer Kalvi aligned (Pre-KG to 5th, all three terms)
✓ Age-appropriate, encouraging, and pedagogically sound
✓ Factually accurate per official Samacheer Kalvi textbooks
✓ Print-ready with clear formatting`;

    // Build question type instruction
    const TYPE_LABEL_MAP: Record<string, string> = {
      multiple_choice: "Multiple Choice (Section B)",
      fill_in_blanks: "Fill in the Blanks (Section A)",
      match_following: "Match the Following (Section C)",
      short_answer: "Short Answer (Section D)",
      true_false: "True or False",
      diagram: "Label/Draw diagram (Section E)",
    };
    const selectedTypes: string[] = Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes : [];

    // Merry Birds: per-type style guidance + auto-default mix when nothing selected
    const merryBirdsTypeGuide = isMerryBirds ? `
🐦 MERRY BIRDS QUESTION TYPE STYLE GUIDE — follow these rules precisely:

• fill_in_blanks → Use for MISSING LETTERS / MISSING SOUNDS (e.g. "c_t", "b__d") OR simple sentence gaps ("The cat sat on the ___"). For phonics topics, at least half the blanks should be missing letter/sound questions.

• match_following → Use for: RHYMING WORDS (cat ↔ bat), OPPOSITES (big ↔ small), ANIMALS & THEIR HOMES (dog ↔ kennel), WORDS & PICTURES descriptions. Column A = word/animal, Column B = rhyme/opposite/home. Keep items short (1–3 words).

• multiple_choice → Use for STORY COMPREHENSION ("In the story, who baked the bread?") or VOCABULARY questions ("Which word means happy? a) sad  b) glad  c) mad  d) bad"). 4 options always.

• diagram → Use for DRAW AND COLOR activities: "Draw a _____ from the story and colour it." or "Draw and label the parts of a ___". Keep label count to 3–4 max.

• short_answer → Use for simple 1-sentence story recall ("Who helped the Little Red Hen?") or rhyme completion ("Jack and Jill went up the _____").

• true_false → Use for story fact checks ("The hen made bread. True or False?") or phonics checks ("'cat' has the short 'a' sound. True or False?").
` : "";

    const questionTypeInstruction = selectedTypes.length > 0
      ? `⭐ IMPORTANT: The teacher has specifically requested these question types — PRIORITIZE and INCLUDE them: ${selectedTypes.map(t => TYPE_LABEL_MAP[t] || t).join(", ")}. Focus the majority of questions on these types.${merryBirdsTypeGuide}`
      : isMerryBirds
        ? `⭐ DEFAULT MERRY BIRDS MIX (no types selected): Include these as your PRIMARY question types:
1. fill_in_blanks — "Fill Missing Sounds/Letters" (e.g. c_t, sh_p, missing word in rhyme)
2. match_following — "Match Rhyming Words" (cat↔bat, hen↔pen) AND "Animals & Their Homes"
3. multiple_choice — Story/poem comprehension (1–2 questions)
4. true_false — Phonics or story fact checks
5. diagram — One "Draw and Colour" activity if topic suits it
${merryBirdsTypeGuide}`
        : "Use a balanced mix of fill-in-blanks, matching, multiple choice, and short answers distributed across sections.";

    const worksheetTitle = isMerryBirds
      ? `Merry Birds Worksheet - Class ${grade} - ${subject} - ${term} - ${topic}`
      : `Samacheer Kalvi Worksheet - ${grade} ${subject} - ${term} - ${topic}`;

    const curriculumRules = isMerryBirds
      ? `3. Questions must be from Oxford Merry Birds ${grade} ${subject} (${term}) for "${topic}" — use joyful, activity-based style with phonics, rhymes, simple stories, poems
4. For Pre-KG/LKG/UKG: Prioritize recognition, matching, coloring/draw, phonics, rhymes — NO complex MCQ or long answers. Max 1–2 word answers only
5. For Class 1–2: Simple sentences, phonics blends, basic grammar (a/an), number operations up to 100
6. For Class 3–5: Stories with comprehension, grammar, essay topics, maths with fractions/decimals, EVS experiments, GK facts
7. For Social Studies: Include maps, India/Tamil Nadu facts, transport, government basics as per term
8. For General Knowledge: Include national symbols, famous Indians, inventions, world facts, sports as per term
9. Keep vocabulary age-appropriate, fun and encouraging. Use picture-friendly language
10. Answers must be correct per Oxford Merry Birds Integrated Term Course content for the specified term`
      : `3. Questions must be from actual Samacheer Kalvi ${grade} ${subject} textbook (${term}) for "${topic}"
4. For Pre-KG/LKG/UKG: Only simple matching, fill-in-blanks, drawing, coloring — NO complex MCQ or short answers
5. For Tamil subject: Include proper Tamil script questions, grammar rules, poetry lines, proverbs as per grade/term
6. For Social Studies: Include maps, India, Tamil Nadu, landforms, rivers, occupations as per Samacheer syllabus
7. Answers must be factually correct per Samacheer Kalvi textbooks for the specified term
8. Make it encouraging and fun for children`;

    const userPrompt = `Create a complete, curriculum-aligned worksheet for ${isMerryBirds ? "Oxford Merry Birds Integrated Term Course" : "Tamil Nadu Samacheer Kalvi"} with these specifications:

Grade: ${grade}
Subject: ${subject}
Term: ${term || "Term 1"}
Topic/Chapter: ${topic}
Number of Questions: ${numQuestions}
Language: ${language} — ${langInstruction}
Difficulty: ${difficulty} — ${difficultyGuide}
${hasDiagram ? "⚠️ This topic requires a DRAW AND LABEL diagram section — include it!" : ""}
${isMerryBirds ? `⭐ Oxford Merry Birds style (${term || "Term 1"}): joyful, activity-based, phonics-rich, picture-friendly questions aligned with ${term || "Term 1"} content` : `Focus on ${term || "Term 1"} topics from the official Samacheer Kalvi ${grade} ${subject} textbook`}

${questionTypeInstruction}

Return ONLY valid JSON (no markdown, no code blocks, no explanations — just raw JSON):

{
  "title": "${worksheetTitle}",
  "grade": "${grade}",
  "subject": "${subject}",
  "topic": "${topic}",
  "instructions": "2-3 sentence encouragement + instructions in ${language} for ${grade} students",
  "sections": [
    {
      "type": "fill_in_blanks",
      "heading": "${language === "Tamil" ? "பிரிவு A: காலி இடங்களை நிரப்புக" : language === "Bilingual" ? "Section A: Fill in the Blanks (காலி இடங்களை நிரப்புக)" : "Section A: Fill in the Blanks"}",
      "questions": [
        { "id": 1, "question": "sentence with _______ for the blank", "answer": "exact answer word" }
      ]
    },
    {
      "type": "multiple_choice",
      "heading": "${language === "Tamil" ? "பிரிவு B: சரியான விடையைத் தேர்க" : language === "Bilingual" ? "Section B: Choose the Correct Answer (சரியான விடையைத் தேர்க)" : "Section B: Choose the Correct Answer"}",
      "questions": [
        { "id": 5, "question": "question text", "options": ["a) option1", "b) option2", "c) option3", "d) option4"], "answer": "a) option1" }
      ]
    },
    {
      "type": "match_following",
      "heading": "${language === "Tamil" ? "பிரிவு C: பொருத்துக" : language === "Bilingual" ? "Section C: Match the Following (பொருத்துக)" : "Section C: Match the Following"}",
      "questions": [
        { "id": 8, "left": ["item1", "item2", "item3", "item4"], "right": ["match_a", "match_b", "match_c", "match_d"], "answers": ["match_b", "match_d", "match_a", "match_c"] }
      ]
    },
    {
      "type": "short_answer",
      "heading": "${language === "Tamil" ? "பிரிவு D: சுருக்கமாக விடை எழுதுக" : language === "Bilingual" ? "Section D: Short Answer (சுருக்கமாக விடை எழுதுக)" : "Section D: Answer in One or Two Sentences"}",
      "questions": [
        { "id": 10, "question": "question text", "answer": "model answer 1-2 sentences" }
      ]
    },
    ${diagramSection}
    {
      "type": "true_false",
      "heading": "${language === "Tamil" ? "பிரிவு: சரியா? தவறா?" : language === "Bilingual" ? "Section: True or False (சரியா? தவறா?)" : "Section: True or False"}",
      "questions": [
        { "id": 12, "question": "statement to evaluate", "answer": "True" }
      ]
    }
  ]
}

CRITICAL RULES:
1. Distribute ${numQuestions} questions sensibly across all sections
2. ${language === "Tamil" ? "ALL text must be in Tamil script — no romanized Tamil, no English" : language === "Bilingual" ? "Every question must have both English and Tamil" : "Keep English simple and clear"}
${curriculumRules}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let worksheet;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      worksheet = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse worksheet. Please try regenerating." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark if diagram is needed
    worksheet._hasDiagram = hasDiagram;

    return new Response(JSON.stringify({ worksheet }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-worksheet error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
