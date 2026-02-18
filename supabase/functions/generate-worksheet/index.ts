import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { grade, subject, topic, numQuestions, language, difficulty } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction =
      language === "Tamil"
        ? "Write all questions and content in Tamil language (தமிழில் எழுதவும்). Use clear Tamil script."
        : language === "Bilingual"
        ? "Write each question in both English and Tamil (bilingual). Show English first, then Tamil translation in parentheses."
        : "Write all questions and content in English.";

    const difficultyGuide =
      difficulty === "Easy"
        ? "Use simple, direct questions suitable for beginners. Focus on recognition and recall."
        : difficulty === "Hard"
        ? "Use analytical, application-based questions that challenge deeper understanding."
        : "Use a balanced mix of simple and moderately challenging questions.";

    const systemPrompt = `You are an expert educational content creator specializing in Tamil Nadu Samacheer Kalvi curriculum for classes LKG to 5th standard. You have deep knowledge of:
- Samacheer Kalvi textbooks and their exact content for each grade
- Age-appropriate question formats for young learners
- Tamil language education methodology
- Child-friendly instructions and language

Always create curriculum-aligned, pedagogically sound worksheets that match the official Samacheer Kalvi syllabus exactly.`;

    const userPrompt = `Create a complete, printable worksheet for Tamil Nadu Samacheer Kalvi curriculum with these specifications:

- Grade: ${grade}
- Subject: ${subject}  
- Topic/Chapter: ${topic}
- Number of Questions: ${numQuestions}
- Language: ${language} — ${langInstruction}
- Difficulty: ${difficulty} — ${difficultyGuide}

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):

{
  "title": "Samacheer Kalvi Worksheet - ${grade} ${subject} - ${topic}",
  "grade": "${grade}",
  "subject": "${subject}",
  "topic": "${topic}",
  "instructions": "A 2-3 sentence instruction for students in simple, encouraging language appropriate for ${grade}",
  "sections": [
    {
      "type": "fill_in_blanks",
      "heading": "Section A: Fill in the Blanks",
      "questions": [
        { "id": 1, "question": "question text with _______ for blank", "answer": "correct answer" }
      ]
    },
    {
      "type": "multiple_choice",
      "heading": "Section B: Choose the Correct Answer",
      "questions": [
        { "id": 2, "question": "question text", "options": ["a) option1", "b) option2", "c) option3", "d) option4"], "answer": "a) option1" }
      ]
    },
    {
      "type": "match_following",
      "heading": "Section C: Match the Following",
      "questions": [
        { "id": 7, "left": ["item1", "item2", "item3"], "right": ["match1", "match2", "match3"], "answers": ["match1", "match3", "match2"] }
      ]
    },
    {
      "type": "short_answer",
      "heading": "Section D: Answer in One or Two Sentences",
      "questions": [
        { "id": 9, "question": "question text", "answer": "model answer" }
      ]
    }
  ]
}

Distribute the ${numQuestions} questions across sections appropriately. Make sure:
1. Questions are 100% aligned with Samacheer Kalvi ${grade} ${subject} textbook content for "${topic}"
2. Language is age-appropriate and encouraging
3. Answer key includes all correct answers
4. For LKG/UKG, focus on matching, drawing, and simple fill-in-the-blanks (no complex MCQ)
5. Answers are factually correct and match the official textbook`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
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

    // Parse JSON from AI response
    let worksheet;
    try {
      // Strip markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      worksheet = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse worksheet. Please try regenerating." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
