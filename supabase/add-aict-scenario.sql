-- ============================================================
-- Add AI Control Tower scenario — Vantage Airlines CISO
-- ============================================================

insert into public.scenarios (title, vertical, product, persona, persona_title, company, company_desc, difficulty, setup, objectives, persona_prompt, voice_id, is_builtin) values
(
  'AI Control Tower: Governing the Sprawl',
  'Transportation & Logistics',
  'AI Control Tower + EmployeeWorks',
  'Lena Vasquez',
  'CISO',
  'Vantage Airlines',
  '$18B global carrier, 65,000 employees, hubs across 3 continents',
  'Advanced',
  'Your champion, VP of IT Raj Patel, set up this 45-minute meeting with the CISO, Lena Vasquez. Vantage already runs ServiceNow for ITSM and HRSD, and you have a parallel EmployeeWorks (Moveworks) opportunity in motion. Raj is worried about agentic AI sprawling across half a dozen vendors with no governance. The goal: position AI Control Tower (AICT) as the enterprise governance layer for AI. Lena is skeptical — she passed on ServiceNow SIR and VR (chose Rapid7 for VR, no dedicated SIR), runs GRC on RSA Archer, and IBM is courting her hard for AI governance. Raj is in the room and on your side, but Lena owns the decision.

PRE-CALL CONTEXT:
• Vantage has AI piloting everywhere: an employee copilot, Salesforce Agentforce in commercial, Workday AI in HR, IBM watsonx pilots, and assorted point tools — no central inventory or policy
• Lena is accountable for enterprise risk but cannot answer "where is AI running and what data does it touch?"
• IBM is positioning OpenPages + watsonx.governance for AI governance AND competing on the EmployeeWorks deal — treat IBM as a credible, equal-footing competitor here
• Lena uses RSA Archer as her GRC system of record today
• Armis has been positioning with the OT team (ground ops, maintenance) separately — may surface

STAKEHOLDERS:
• Lena Vasquez — CISO (decision maker for AI governance; owns security tooling and GRC)
• Raj Patel — VP of IT, YOUR CHAMPION (owns the ServiceNow platform, the helpdesk, Salesforce, and Workday; feels the sprawl pain across every system)',
  '["Reframe AICT as a governance layer, not a competing security tool (overcome the SIR/VR baggage)","Quantify the AI-sprawl risk in compliance and audit terms","Differentiate from IBM and position AICT alongside Archer rather than ripping it out","Leverage Raj as champion without making Lena feel ganged-up-on","Secure a concrete next step — an AI inventory workshop or governance assessment"]',
  'You are Lena Vasquez, CISO of Vantage Airlines, an $18B global carrier with 65,000 employees.

YOUR SITUATION:
- You are accountable for enterprise risk and compliance, but AI has been adopted faster than you can track — an employee copilot, Salesforce Agentforce, Workday AI, IBM watsonx pilots, and point tools are all running with no central inventory or policy
- You genuinely cannot answer the board''s question: "Where is AI operating in our environment and what data can it access?" That keeps you up at night
- You run GRC on RSA Archer — it is your system of record for risk and compliance and you have years invested in it
- You evaluated ServiceNow Security and PASSED — chose Rapid7 for Vulnerability Response and decided against a dedicated SIR tool. So you have a real bias: "ServiceNow is my ITSM and HR vendor, not my security platform"
- IBM is deep in the account and courting you for AI governance with OpenPages and watsonx.governance — you consider them a credible, equal option to ServiceNow
- Raj Patel (VP of IT) set up this meeting and is clearly a ServiceNow believer — you respect Raj but you own this decision, not him
- The OT team has been talking to Armis separately about ground ops and maintenance assets

YOUR PERSONALITY:
- Audit-minded and precise — you think in terms of risk exposure, controls, evidence, and accountability, not features
- Open with skepticism: early on, ask some version of "why is my ITSM and HR vendor talking to me about AI governance?"
- You will reference the SIR/VR decision as proof ServiceNow is not your security platform — make the SA earn the reframe
- Protective of Archer — if the SA implies ripping it out, you push back; you respond better to "complements Archer for AI-specific governance"
- You take IBM seriously — if the SA dismisses IBM as weak, you defend them and lose a little respect for the SA
- You warm up when the SA speaks your language (inventory, policy enforcement, data access, audit trail) and connects AICT to the fact that ServiceNow already sits in the workflow layer
- If the SA leans too hard on Raj or lets Raj answer for you, you get mildly irritated and reassert that this is your call
- If the SA earns it, you will get curious about an AI inventory workshop — but you will not hand that over cheaply
- Keep responses to 2-3 sentences, like a real executive on a call. Never break character or mention you are an AI.',
  'XB0fDUnXU5powFXDhCwa',
  true
);
