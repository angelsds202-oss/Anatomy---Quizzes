window.QUESTION_BANK = window.QUESTION_BANK || [];

window.QUESTION_BANK.push(
  // LTC infection prevention
  { pack:"Safety: Infection", track:"BOTH", topic:"Immune/Lymphatic", subtopic:"IPC basics", q:"Standard infection prevention includes:", choices:["Hand hygiene before/after patient contact","Only gloves—no hand hygiene","Reuse single-use items","Never clean shared equipment"], answerIndex:0, explanation:"Hand hygiene + equipment cleaning are foundational IPC measures." },

  // Acute sepsis/anaphylaxis
  { pack:"Safety: Deterioration", track:"ACUTE", topic:"Immune/Lymphatic", subtopic:"Sepsis concern", q:"Which observations raise concern for sepsis?", choices:["Temp 38.8, HR 120, RR 26, new confusion","Temp 36.6, HR 70, RR 14, alert","Temp 37.0, HR 80, RR 16","Temp 36.8, HR 65, RR 12"], answerIndex:0, explanation:"Sepsis red flags: fever, tachycardia, tachypnoea, altered mental state—use local pathway." },
  { pack:"Safety: Deterioration", track:"ACUTE", topic:"Immune/Lymphatic", subtopic:"Anaphylaxis", q:"Anaphylaxis is most consistent with:", choices:["Localised itch only","Airway/breathing compromise ± hypotension after allergen exposure","Chronic fatigue","Mild nausea only"], answerIndex:1, explanation:"Anaphylaxis is a medical emergency—follow emergency protocol and escalate." },

  // Wounds / pressure injuries (LTC + acute settings)
  { pack:"Year 2", track:"BOTH", topic:"Integumentary", subtopic:"Pressure injury prevention", q:"Core pressure injury prevention action is:", choices:["Massage reddened bony prominences","Regular repositioning + pressure relief + skin checks","Keep skin wet","Avoid skin inspection"], answerIndex:1, explanation:"Repositioning/offloading + regular skin assessment reduces risk." },
  { pack:"Year 2", track:"BOTH", topic:"Integumentary", subtopic:"Wound infection signs", q:"Which is most concerning for wound infection?", choices:["Mild itch","Increasing pain/redness/swelling with purulent exudate","Dry intact dressing","Old scar"], answerIndex:1, explanation:"Infection signs: increasing erythema, warmth, swelling, pain, purulent exudate, odour, systemic features." }
);
window.QUESTION_BANK.push(
  // ===== LTC: infection prevention and chronic wounds =====
  { pack:"Year 2", track:"LTC", topic:"Immune/Lymphatic", subtopic:"Vaccination", q:"Vaccination in chronic disease is important because it:", choices:["Has no impact","Reduces risk of severe respiratory infections and exacerbations","Replaces all meds","Causes COPD"], answerIndex:1, explanation:"Vaccination helps reduce infection severity and complications in vulnerable groups." },
  { pack:"Year 2", track:"BOTH", topic:"Integumentary", subtopic:"Venous leg ulcers", q:"Which feature is more typical of venous disease than arterial disease?", choices:["Pain worse on elevation and pale cold foot","Swelling + skin changes around ankles","Sudden facial droop","Fruity breath"], answerIndex:1, explanation:"Venous disease: oedema, hyperpigmentation/eczema; arterial disease: cold pale painful, worse on elevation." },

  // ===== ACUTE: cellulitis, sepsis escalation, line infection awareness =====
  { pack:"Year 2", track:"ACUTE", topic:"Immune/Lymphatic", subtopic:"Cellulitis signs", q:"Which finding suggests cellulitis requiring escalation?", choices:["Local warmth, redness, swelling, pain +/- fever","Dry skin only","Hair loss","Nasal congestion"], answerIndex:0, explanation:"Cellulitis: erythema, warmth, swelling, pain; systemic symptoms possible." },
  { pack:"Year 2", track:"ACUTE", topic:"Immune/Lymphatic", subtopic:"Sepsis safety-net", q:"Which patient statement is most concerning and needs urgent escalation?", choices:["‘I feel a bit tired’","‘I feel suddenly confused and shivery’","‘My knee aches after walking’","‘I slept poorly’"], answerIndex:1, explanation:"New confusion and rigors can be sepsis red flags—escalate promptly." },
  { pack:"Year 2", track:"ACUTE", topic:"Integumentary", subtopic:"Pressure injury risk", q:"Which patient is at highest risk of pressure injury?", choices:["Mobile and independent","Bedbound with poor nutrition and incontinence","Walks daily","No comorbidities"], answerIndex:1, explanation:"Immobility + incontinence + poor nutrition increases risk—prevent proactively." }
);
