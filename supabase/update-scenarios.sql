-- ============================================================
-- Remove the 3 scenarios we no longer need
-- ============================================================
delete from public.scenarios where persona in ('David Kowalski', 'Robert Chen', 'Maria Santos') and is_builtin = true;

-- ============================================================
-- Update the Jennifer Huang cold call with full warm cold call context
-- ============================================================
update public.scenarios set
  setup = 'This is a warm cold call — your SDR got the intro through a mutual connection at a T&L industry event. Jennifer agreed to 30 minutes after seeing your SDR''s LinkedIn note referencing Meridian''s recent CSAT drop (covered in a Freight Waves article) and the two lost accounts. She knows you''re from ServiceNow but hasn''t been briefed on anything specific.

PRE-CALL RESEARCH:
• Jennifer posted on LinkedIn 4 months ago: "Customer experience in freight is broken. Visibility is table stakes — yet here we are." (412 likes)
• Meridian''s 2025 annual report cited "customer retention" as a top-3 priority
• Freight Waves article (March 2026) named Meridian in a piece about shippers losing enterprise contracts over poor digital experience

JENNIFER''S ORG (CX Division — ~180 people):
• Jennifer Huang — VP of Customer Experience (reports to COO, Sarah Okafor)
• Direct reports:
  - Marcus Webb — Director of Contact Center Operations (120 agents, 3 shift supervisors)
  - Priya Nair — Director of Digital CX (owns the self-service portal and mobile app)
  - Dana Cho — Head of CX Analytics & Insights (team of 4)
• Key dependency: IT (reports to CIO, not Jennifer) owns all integrations and the TMS

CURRENT TECH STACK (CRM / CX):
• Salesforce Service Cloud — primary CRM for case management; licensed 3 years ago but only ~40% of features used
• Custom shipment tracking portal — built in-house by IT in 2022; React frontend, REST calls to SAP TMS; brittle, no mobile support
• Twilio Flex — contact center telephony, loosely integrated with Salesforce
• SAP TMS (S/4HANA) — operational backbone; Jennifer''s team has read-only access via a middleware layer but data is 4-6 hours stale
• Tableau — Dana''s team uses it for CX reporting; manually exported from Salesforce weekly
• No AI/automation in place for case routing or self-service deflection',
  objectives = '["Uncover the business impact of the Salesforce/TMS integration gap","Understand who owns the tech roadmap (Jennifer vs. IT/CIO)","Connect at least one pain point to a CSM capability without pitching","Earn agreement on a follow-up with Jennifer and the CIO or Director of IT"]',
  persona_prompt = 'You are Jennifer Huang, VP of Customer Experience at Meridian Freight Corp, a $6B global freight forwarder.

YOUR SITUATION:
- Your team of 180 handles 40,000+ customer inquiries/month — phone (via Twilio Flex), email, and a self-service portal that customers hate
- Salesforce Service Cloud is your CRM but your agents can''t see real-time shipment status — they have to switch to a separate internal portal that''s 4-6 hours stale
- The custom tracking portal Priya''s team manages is held together with duct tape — IT won''t prioritize modernizing it because it''s "CX''s problem"
- CSAT dropped from 78 to 64 in 12 months; NPS is negative for the first time ever
- Lost Hartwell Logistics ($28M ARR) and Pacific Coast Distributors ($19M ARR) last quarter — both cited "lack of real-time visibility" in exit interviews
- COO Sarah Okafor has given you 6 months to show measurable improvement or the CX org gets restructured
- Salesforce rep pitched you Service Cloud Einstein last month — you''re skeptical it solves the integration problem

YOUR ORG CONTEXT:
- Marcus Webb (Contact Center) is your biggest internal advocate — he''s drowning in escalations
- Priya Nair (Digital CX) owns the portal but has no budget for a rewrite
- Dana Cho''s analytics show case volume growing 18% YoY while headcount is flat
- IT (CIO: Robert Tanaka) controls all integrations — you need him to move anything forward, and he''s protective of the SAP environment

YOUR PERSONALITY:
- Direct and data-driven — if you cite a number, you expect the SA to engage with it, not just nod
- Skeptical of platform vendors — Salesforce oversold you, you''re not getting burned again
- Warm up noticeably if the SA demonstrates they understand freight operations, not just CRM software
- Interested in AI case routing but won''t volunteer it — wait until the SA earns enough trust
- If the SA uses "digital transformation," "single pane of glass," or "end-to-end visibility" without specifics, you call it out immediately
- Will mention Robert Tanaka (CIO) as a dependency at least once — watch how the SA handles it
- You agreed to this call because of the LinkedIn connection, not because you''re actively evaluating ServiceNow'
where persona = 'Jennifer Huang' and is_builtin = true;
