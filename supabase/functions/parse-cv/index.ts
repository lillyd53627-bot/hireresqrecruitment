import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cv_url, user_id } = await req.json();

    if (!cv_url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing cv_url'
      }), { headers: corsHeaders, status: 400 });
    }

    console.log("📄 Fetching CV:", cv_url);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ============================
    // 1. FETCH PDF
    // ============================
    const response = await fetch(cv_url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // ============================
    // 2. PARSE PDF TEXT
    // ============================
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map(item => item.str || '');
      fullText += strings.join(' ') + '\n';
    }

    console.log("🧠 Extracted text length:", fullText.length);

    if (!fullText || fullText.length < 50) {
      throw new Error("PDF parsing failed - no readable text");
    }

    // ============================
    // 3. BASIC EXTRACTION
    // ============================
    const lower = fullText.toLowerCase();

    const skillKeywords = [
      "sales","marketing","recruitment","sourcing","hr","talent",
      "leadership","management","negotiation","communication",
      "python","javascript","sql","excel","crm","ats",
      "interview","hiring"
    ];

    const extractedSkills = skillKeywords.filter(skill =>
      lower.includes(skill)
    );

    // VERY BASIC NAME DETECTION (first line)
    const firstLine = fullText.split('\n')[0] || 'Candidate';

    // ============================
    // 4. INSERT INTO DATABASE
    // ============================
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        user_id: user_id,
        name: firstLine.substring(0, 80),
        title: "Candidate",
        location: null,
        skills: extractedSkills.join(', ') || null,
        raw_cv_text: fullText,
        cv_file_path: cv_url,
        stage: 'sourced',
        match_score: 0
      })
      .select()
      .single();

    if (error) {
      console.error("❌ DB insert error:", error);
      throw error;
    }

    console.log("✅ Candidate inserted:", data.id);

    return new Response(JSON.stringify({
      success: true,
      candidate: data,
      extracted_skills: extractedSkills,
      text_length: fullText.length
    }), { headers: corsHeaders });

  } catch (err) {
    console.error("❌ parse-cv error:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});