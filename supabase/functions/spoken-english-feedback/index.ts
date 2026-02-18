import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { targetText, spokenText, grade, topic, mode, conversationHistory, tamilMode } = await req.json();

    let systemPrompt = `You are "Sparky", a friendly and encouraging English pronunciation coach for Tamil Nadu school children (LKG to 5th Grade). You speak clearly, use simple words, and always encourage children.

Your job:
1. Compare what the child SAID vs what they SHOULD HAVE SAID.
2. Give warm, specific feedback on pronunciation mistakes.
3. Mention specific sounds that need work (e.g., "th", "r", "v").
4. Always be positive and encouraging. Never say "Wrong" — say "Let's try again!"
5. Give a STAR RATING (1-5 stars) based on accuracy.
6. Keep responses SHORT — 2-3 sentences max for kids.
7. If tamilMode is true, explain difficult parts in simple Tamil.

STAR RATING RULES:
- 5 stars: 90-100% match (Amazing! Perfect!)
- 4 stars: 75-89% match (Very good! Almost perfect!)
- 3 stars: 55-74% match (Good try! A few sounds to fix.)
- 2 stars: 35-54% match (Keep trying! Let's practice together.)
- 1 star: 0-34% match (Let's try again slowly!)

RESPOND ONLY IN THIS JSON FORMAT:
{
  "stars": 4,
  "feedback": "Wow! You said 'cat' almost perfectly! Try making the 't' sound a bit sharper at the end.",
  "tamilFeedback": "${tamilMode ? "Optional Tamil explanation here" : ""}",
  "improvement": "Focus on the 't' at the end of words.",
  "encouragement": "You're doing great! Keep going! 🌟",
  "nextWord": ""
}`;

    let userMessage = "";

    if (mode === "practice") {
      userMessage = `The child (Grade: ${grade}) was asked to say: "${targetText}"
They actually said: "${spokenText}"
Topic: ${topic}
${tamilMode ? "Please include Tamil explanation in tamilFeedback field." : ""}

Analyze their pronunciation and give feedback.`;
    } else if (mode === "conversation") {
      userMessage = `You are having a friendly English conversation with a ${grade} student.
Topic: ${topic}
${tamilMode ? "If they seem confused, briefly help in Tamil in tamilFeedback." : ""}

Previous conversation:
${JSON.stringify(conversationHistory || [])}

Child just said: "${spokenText}"

Respond naturally and encouragingly. In "feedback" field, write your conversational response. In "improvement" field, gently note any pronunciation tips. In "nextWord" field, write the exact text you want to say back to the child (for TTS).`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      throw new Error(`AI gateway error [${response.status}]: ${t}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { stars: 3, feedback: content, encouragement: "Keep going! 🌟", improvement: "", nextWord: "" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Feedback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
