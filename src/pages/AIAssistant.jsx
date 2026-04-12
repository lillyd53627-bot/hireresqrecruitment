const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage = { id: Date.now(), role: 'user', content: input.trim() };
  setMessages(prev => [...prev, userMessage]);
  const currentInput = input.trim();
  setInput('');
  setIsLoading(true);

  try {
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemlwa2xxYXhpdXBiaGdnYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjYwMjMsImV4cCI6MjA5MDE0MjAyM30.N-9NaDds_ZZ2sfL8Tp-WX_NRH2UOjzNrIbRbBpUcGPo";

    const response = await fetch('https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/ai-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({ message: currentInput })
    });

    console.log("AI Assistant fetch status:", response.status);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: data.response || "I understood your request. How else can I help with recruitment today?"
    };

    setMessages(prev => [...prev, assistantMessage]);
  } catch (err) {
    console.error("AI Assistant error:", err);
    const fallback = {
      id: Date.now() + 1,
      role: 'assistant',
      content: "I'm having trouble connecting right now. Try asking something like 'Find sales managers in Johannesburg' or 'Write an outreach email for a senior developer'."
    };
    setMessages(prev => [...prev, fallback]);
    toast.error("AI service is temporarily unavailable.");
  } finally {
    setIsLoading(false);
  }
};