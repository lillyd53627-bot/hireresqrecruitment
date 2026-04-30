import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cv_url, user_id } = await req.json();

    if (!cv_url) {
      return new Response(JSON.stringify({ success: false, error: 'Missing CV URL' }), 
        { headers: corsHeaders, status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Step 1: Download the PDF as ArrayBuffer
    const pdfResponse = await fetch(cv_url);
    if (!pdfResponse.ok) throw new Error('Failed to fetch PDF');
    
    const pdfBuffer = new Uint8Array(await pdfResponse.arrayBuffer());

    // Step 2: Simple but effective text extraction using pdf.js (works in Deno)
    const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    // Step 3: Generate Embedding using Supabase built-in AI (recommended for speed & cost)
    const session = new Supabase.ai.Session('gte-small');   // Built-in model
    const embeddingResult = await session.run(fullText.substring(0, 8000), {  // Limit length
      mean_pool: true,
      normalize: true,
    });

    const embedding = embeddingResult.embedding;

    // Step 4: Save to candidates table
    const candidate = {
      user_id: user_id,
      name: "Extracted Candidate",           // TODO: Improve name extraction
      title: "Unknown",
      location: "South Africa",
      raw_cv_text: fullText,
      parsed_data: { raw_text: fullText },
      embedding: embedding,                  // Save vector
      skills: [],                            // TODO: Extract skills
      stage: 'sourced',
      status: 'active',
      cv_file_path: cv_url,
      source: 'upload'
    };

    const { data, error } = await supabase
      .from('candidates')
      .insert([candidate])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      candidate: data,
      text_length: fullText.length
    }), { headers: corsHeaders });

  } catch (err) {
    console.error("parse-cv error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { 
      headers: corsHeaders, 
      status: 500 
    });
  }
});