import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the friendly AI assistant for Nethaji Vidhyalayam, a school in Chennai, India. You help parents, students, and visitors with information about the school.

KEY SCHOOL INFORMATION:
- School Name: Nethaji Vidhyalayam (also spelled Nethaji Vidyalayam)
- Address: 5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129
- Phone: 9841594945 / 6380967675
- Email: nethajividhyalayam@gmail.com
- School Hours: Mon-Sat, 8:50 AM - 3:30 PM. Closed on Sundays.
- Curriculum: State board curriculum
- Classes: From Nursery/LKG to higher classes
- Facilities: Well-equipped classrooms, playground, computer lab, library

GUIDELINES:
- Be warm, welcoming, and helpful
- Answer in the same language the user writes in (English, Tamil, Hindi, etc.)
- For admission queries, encourage them to visit the school or call the numbers above
- For questions you don't know the answer to, politely say you're not sure and suggest contacting the school directly
- Keep answers concise and friendly
- You can also answer general knowledge questions since you're a school assistant`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
