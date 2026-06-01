const API_ENDPOINT = '/api/chat';

export async function callClaude({ messages, system, model, max_tokens }) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, system, model, max_tokens }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('AI Sales Coach AI error:', err);
      return { text: "I'm having trouble connecting. Try again.", error: true };
    }
    const data = await response.json();
    return { text: data.content?.[0]?.text || "Could you repeat that?", usage: data.usage, error: false };
  } catch (error) {
    console.error('AI Sales Coach network error:', error);
    return { text: "Can't reach the AI service. Check your connection.", error: true };
  }
}
