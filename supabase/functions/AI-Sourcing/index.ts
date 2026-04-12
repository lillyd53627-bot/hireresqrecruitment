const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required", candidates: [] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const prompt = `
You are an expert recruitment sourcing AI.

Generate 5 high-quality candidate profiles for:
"${query}"

Each candidate must include:
- id (number)
- name
- title
- location
- skills (array)
- experience_years (number)
- match_score (0-100)

Return ONLY JSON:
{
  "candidates": [...]
}
`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a recruitment AI." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      }
    );

    const aiData = await aiResponse.json();

    let candidates = [];

    try {
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      candidates = parsed.candidates || [];
    } catch (err) {
      console.error("AI JSON parse error:", err);
    }

    return new Response(
      JSON.stringify({ candidates }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Edge Function Error:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        candidates: [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});