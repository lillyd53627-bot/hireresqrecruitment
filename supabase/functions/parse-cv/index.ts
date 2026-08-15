const parseCV = async (cvUrl, cvText) => {
  console.log("Sending to parse-cv:", {
    hasUrl: !!cvUrl,
    textLength: cvText?.length
  });

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/parse-cv`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        cv_url: cvUrl,
        cv_text: cvText
      })
    }
  );

  const result = await response.json();

  console.log("Parse Response:", result);

  if (!response.ok) {
    throw new Error(result.error || 'Parse failed');
  }

  return result;
};