const runAIScoring = async () => {

  if (!jobDescription.trim()) {
    toast.error('Please enter a job description')
    return
  }

  setMatching(true)

  try {

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/semantic-match`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          job_description: jobDescription
        })
      }
    )

    // HANDLE FAILED RESPONSE
    if (!response.ok) {

      const text = await response.text()

      console.error('FUNCTION ERROR:', text)

      throw new Error(
        `Semantic match failed: ${response.status}`
      )
    }

    const result = await response.json()

    console.log('MATCH RESULT:', result)

    if (!result.success) {
      throw new Error(result.error)
    }

    setCandidates(result.scoredCandidates || [])

    toast.success(
      `Matched ${result.count || 0} candidates`
    )

  } catch (err) {

    console.error(err)

    toast.error(err.message)

  } finally {

    setMatching(false)
  }
}