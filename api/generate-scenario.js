export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers, fileText } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const fileContext = fileText
    ? `\n\nSUPPORTING MATERIAL (extracted from uploaded file — use for context only):\n${fileText}\n`
    : '';

  const prompt = `You are an expert pre-sales training designer building a role-play scenario for ServiceNow Solution Architects.

USER'S ANSWERS:
${answers}
${fileContext}

INSTRUCTIONS:
1. Generate a realistic, challenging customer persona for a ServiceNow SA role-play scenario.
2. If any real names or company names appear in the supporting material, replace them with fictional but realistic alternatives in the same industry and sub-segment (e.g., keep "large regional freight forwarder" but rename the company).
3. The difficulty should be either "Intermediate" or "Advanced" based on the complexity described.
4. Choose the most appropriate ElevenLabs voice ID for the persona's gender and character:
   - Professional female (calm): 21m00Tcm4TlvDq8ikWAM
   - Strong female (confident): AZnzlk1XvdvUeBnXmlld
   - Deep male (authoritative): pNInz6obpgDQGcFmaJgB
   - Smooth male (strategic): TxGEqnHWrfWFTfGW9XjX

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "title": "Short scenario title (e.g. 'Cold Discovery: Retail CIO')",
  "vertical": "Industry vertical",
  "product": "ServiceNow product area(s)",
  "persona": "First and Last Name (fictional)",
  "personaTitle": "Job title",
  "company": "Company name (fictional)",
  "companyDesc": "One line: size, industry, key facts",
  "difficulty": "Intermediate" or "Advanced",
  "setup": "2-3 sentence briefing for the SA — what's the situation going into this call",
  "objectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
  "personaPrompt": "Full system prompt for the AI to play this persona. Include YOUR SITUATION (5-6 bullet points of context) and YOUR PERSONALITY (5-6 bullet points of behavioral traits, objections, triggers). Make the persona realistic and challenging.",
  "voiceId": "one of the four voice IDs above"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'API error' });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || '{}';

    try {
      const scenario = JSON.parse(raw.replace(/```json|```/g, '').trim());
      return res.status(200).json(scenario);
    } catch {
      return res.status(500).json({ error: 'Failed to parse scenario JSON', raw });
    }
  } catch (error) {
    console.error('Generate scenario error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
