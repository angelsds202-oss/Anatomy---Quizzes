window.QUESTION_BANK = window.QUESTION_BANK || [];

window.QUESTION_BANK.push(
  // Safety / deterioration (mostly ACUTE)
  { pack:"Safety: Deterioration", track:"ACUTE", topic:"Clinical Deterioration", subtopic:"ABCDE", q:"You find a patient newly drowsy and clammy. What is your most appropriate first action?", choices:["Do a full history then examine","Start ABCDE and treat immediate life threats","Wait for a doctor before checking obs","Offer food and fluids"], answerIndex:1, explanation:"NMC-style prioritisation: ABCDE first to identify/treat life-threatening problems." },
  { pack:"Safety: Deterioration", track:"ACUTE", topic:"Clinical Deterioration", subtopic:"Escalation", q:"A patient’s RR rises to 30 with SpO₂ 89% on air. What is best?", choices:["Recheck in 30 minutes","Escalate urgently and give oxygen per policy if hypoxic","Give oral fluids","Encourage sleep"], answerIndex:1, explanation:"Hypoxia + tachypnoea requires urgent escalation and prompt support." },

  // Medicines management (LTC + ACUTE)
  { pack:"Safety: Medicines", track:"BOTH", topic:"Pharmacology Safety", subtopic:"5 Rights", q:"Which is essential before administering any medicine?", choices:["5 rights + allergy check + right documentation","Only check label once","Skip ID checks if you recognise them","Give first then document later"], answerIndex:0, explanation:"Safety basics: right patient/drug/dose/route/time + allergies and documentation." },
  { pack:"Safety: Medicines", track:"BOTH", topic:"Pharmacology Safety", subtopic:"Insulin", q:"Before giving insulin, you must check:", choices:["Blood glucose and meal timing/plan","Temperature only","Pain score only","Pulse only"], answerIndex:0, explanation:"Insulin can cause hypoglycaemia—check BG and ensure appropriate intake/timing." },
  { pack:"Safety: Medicines", track:"ACUTE", topic:"Pharmacology Safety", subtopic:"Opioids", q:"Patient is very drowsy with slow respirations after opioids. What is priority?", choices:["Give more opioid for pain","Escalate urgently and follow opioid toxicity protocol (naloxone may be required)","Send them to sleep","Give oral fluids"], answerIndex:1, explanation:"Respiratory depression is life-threatening. Escalate and follow local policy." },

  // Documentation / NMC professionalism (BOTH)
  { pack:"Safety: Documentation", track:"BOTH", topic:"Professional Practice", subtopic:"Documentation", q:"Best documentation approach after an incident?", choices:["Only document if asked","Document promptly, factually, and escalate per policy","Use opinions and blame","Document later from memory"], answerIndex:1, explanation:"NMC-aligned: timely, factual, objective documentation + escalation." }
);
