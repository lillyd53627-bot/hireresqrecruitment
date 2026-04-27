Deno.serve(async (req) => {
  const { candidate, job_description } = await req.json();

  return new Response(JSON.stringify({
    message: `Hi ${candidate.name}, we have an exciting role for you based on your experience in ${candidate.title}...`
  }));
});