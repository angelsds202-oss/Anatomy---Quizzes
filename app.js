const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "nmcQuizProgress_v5";
const BANK = Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK : [];

const defaultProgress = () => ({
  overall: { answered: 0, correct: 0, streak: 0, lastDay: null },
  topics: {} // topic -> { answered, correct, wrongIds, seenIds }
});

function loadProgress(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return parsed && parsed.overall && parsed.topics ? parsed : defaultProgress();
  }catch{
    return defaultProgress();
  }
}
function saveProgress(p){ localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function qId(q){
  return `${q.pack||""}||${q.track||""}||${q.topic||""}||${q.subtopic||""}||${q.q||""}`;
}

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function weightedPick(questions, weights, limit){
  const pool = questions.map((q,i)=>({q, w: Math.max(1, weights[i] ?? 1)}));
  const picked = [];
  for(let k=0; k<Math.min(limit, pool.length); k++){
    const totalW = pool.reduce((s,x)=>s+x.w,0);
    let r = Math.random()*totalW;
    let idx = 0;
    while(idx < pool.length){
      r -= pool[idx].w;
      if(r <= 0) break;
      idx++;
    }
    picked.push(pool[idx].q);
    pool.splice(idx,1);
  }
  return picked;
}

let progress = loadProgress();

function ensureTopicRecord(topic){
  if(!progress.topics[topic]){
    progress.topics[topic] = { answered:0, correct:0, wrongIds:{}, seenIds:{} };
  }
  return progress.topics[topic];
}

function topicStats(topic){
  const t = progress.topics[topic] || { answered:0, correct:0, wrongIds:{}, seenIds:{} };
  const acc = t.answered ? Math.round((t.correct/t.answered)*100) : 0;
  return { ...t, accuracy: acc };
}

function overallStats(){
  const o = progress.overall;
  const acc = o.answered ? Math.round((o.correct/o.answered)*100) : 0;
  return { ...o, accuracy: acc };
}

function uniqueTopics(qs){
  return [...new Set(qs.map(q => q.topic).filter(Boolean))].sort();
}
function uniqueSubtopics(qs){
  return [...new Set(qs.map(q => q.subtopic).filter(Boolean))].sort();
}

/* ========= Packs / Sections ========= */
function packFilter(qs, pack){
  if(!pack || pack === "All packs") return qs;

  if(pack === "Y2: Long-term conditions"){
    return qs.filter(q =>
      q.pack === "Year 2" &&
      (q.track === "LTC" || q.track === "BOTH")
    );
  }

  if(pack === "Y2: Acute & deterioration"){
    return qs.filter(q =>
      (q.pack === "Year 2" || (q.pack || "").startsWith("Safety:")) &&
      (q.track === "ACUTE" || q.track === "BOTH" || (q.pack || "").startsWith("Safety:"))
    );
  }

  if(pack === "Mixed Revision (Y2)"){
    return qs.filter(q =>
      q.pack === "Year 2" ||
      q.pack === "Year 1" ||
      (q.pack || "").startsWith("Safety:")
    );
  }

  if(pack === "Safety Only"){
    return qs.filter(q => (q.pack || "").startsWith("Safety:"));
  }

  return qs;
}

function applyFilters(){
  const pack = $("packSelect").value;
  const sub = $("subtopicSelect").value;
  const query = $("searchInput").value.trim().toLowerCase();

  let qs = packFilter(BANK, pack);

  if(sub) qs = qs.filter(q => q.subtopic === sub);
  if(query){
    qs = qs.filter(q =>
      (q.topic || "").toLowerCase().includes(query) ||
      (q.subtopic || "").toLowerCase().includes(query) ||
      (q.q || "").toLowerCase().includes(query)
    );
  }
  return qs;
}

function updateHeaderStats(){
  const o = overallStats();
  $("statStreak").textContent = o.streak;
  $("statAccuracy").textContent = `${o.accuracy}%`;
  $("statAnswered").textContent = o.answered;
  $("statTopics").textContent = uniqueTopics(BANK).length;
}

function renderSubtopicSelect(){
  const pack = $("packSelect").value;
  const filtered = packFilter(BANK, pack);
  const subs = uniqueSubtopics(filtered);

  const current = $("subtopicSelect").value;
  $("subtopicSelect").innerHTML =
    `<option value="">All subtopics</option>` +
    subs.map(s => `<option value="${s}">${s}</option>`).join("");

  if(current && subs.includes(current)) $("subtopicSelect").value = current;
}

/* ========= Tabs ========= */
function showTab(tab){
  const map = {
    home: $("homeSection"),
    quiz: $("quizSection"),
    stats: $("statsSection"),
    tools: $("toolsSection"),
  };
  Object.values(map).forEach(el => el.classList.add("hidden"));
  map[tab].classList.remove("hidden");

  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));

  if(tab === "stats") renderStats();
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", ()=> showTab(btn.dataset.tab));
});

/* ========= Home topic cards ========= */
function buildTopicCard(topic, qsInTopic){
  const st = topicStats(topic);
  const totalQs = qsInTopic.length;

  const accPillClass = st.answered
    ? (st.accuracy >= 75 ? "good" : st.accuracy >= 50 ? "" : "bad")
    : "soft";

  const div = document.createElement("div");
  div.className = "card topic";
  div.innerHTML = `
    <div class="head">
      <div>
        <div class="name">${topic}</div>
        <div class="mini">${totalQs} questions</div>
      </div>
      <div class="badges">
        <span class="pill ${accPillClass}">${st.answered ? `${st.accuracy}%` : "New"}</span>
        <span class="pill soft">${st.answered} answered</span>
      </div>
    </div>
    <button class="btn" data-topic="${topic}">Start</button>
  `;
  div.querySelector("button").addEventListener("click", () => start(topic));
  return div;
}

function renderTopics(){
  const grid = $("topicGrid");
  grid.innerHTML = "";

  const qs = applyFilters();
  const topics = uniqueTopics(qs);

  topics.forEach(t => {
    const qsInTopic = qs.filter(q => q.topic === t);
    grid.appendChild(buildTopicCard(t, qsInTopic));
  });

  updateHeaderStats();
}

/* ========= Quiz state ========= */
let state = {
  running:false,
  mode:"quiz",
  topic:null,
  deck:[],
  idx:0,
  score:0,
  answered:false,
  activeQ:null,
  pack:"Y2: Long-term conditions"
};

function updateQuizUI(){
  const total = state.deck.length || 1;
  const pct = state.running ? (state.idx/total)*100 : 0;
  $("bar").style.width = `${pct}%`;
  $("quizMeta").textContent = `Question ${Math.min(state.idx+1, total)} of ${total}`;
  $("scorePill").textContent = `Score: ${state.score}`;
  $("modePill").textContent = `Mode: ${state.mode}`;
  $("packPill").textContent = `Pack: ${state.pack}`;
}

function setStatus(text){ $("statusPill").textContent = text; }

function markSeen(q){
  const id = qId(q);
  const t = ensureTopicRecord(q.topic);
  t.seenIds[id] = (t.seenIds[id] ?? 0) + 1;
}

function recordResult(q, correct){
  const id = qId(q);
  const day = todayKey();

  const t = ensureTopicRecord(q.topic);
  t.answered += 1;
  if(correct) t.correct += 1;

  if(!correct){
    t.wrongIds[id] = (t.wrongIds[id] ?? 0) + 1;
  } else {
    if(t.wrongIds[id]) t.wrongIds[id] = Math.max(0, t.wrongIds[id]-1);
    if(t.wrongIds[id] === 0) delete t.wrongIds[id];
  }

  progress.overall.answered += 1;
  if(correct) progress.overall.correct += 1;

  const last = progress.overall.lastDay;
  if(last !== day){
    const lastDate = last ? new Date(last + "T00:00:00") : null;
    const now = new Date(day + "T00:00:00");
    const diffDays = lastDate ? Math.round((now - lastDate)/(1000*60*60*24)) : 999;
    progress.overall.streak = (diffDays === 1) ? (progress.overall.streak + 1) : 1;
    progress.overall.lastDay = day;
  }

  saveProgress(progress);
}

function renderQuestion(){
  const q = state.deck[state.idx];
  state.activeQ = q;

  if(!q){
    finish();
    return;
  }

  state.answered = false;
  setStatus("Running");
  $("nextBtn").disabled = true;
  $("revealBtn").disabled = false;

  $("quizTitle").textContent = `${q.topic} • ${q.subtopic || "Mixed"}`;

  $("questionArea").innerHTML = `
    <div class="q">${q.q}</div>
    <div class="choices">
      ${q.choices.map((c,i)=>`<button class="choice" data-i="${i}">${c}</button>`).join("")}
    </div>
    <div class="explain" id="explain"></div>
  `;

  document.querySelectorAll(".choice").forEach(btn=>{
    btn.addEventListener("click", ()=> choose(parseInt(btn.dataset.i,10)));
  });

  updateQuizUI();
}

function choose(i){
  if(state.answered) return;

  const q = state.activeQ;
  state.answered = true;

  const buttons = [...document.querySelectorAll(".choice")];
  buttons.forEach((b, idx)=>{
    if(idx === q.answerIndex) b.classList.add("correct");
    if(idx === i && i !== q.answerIndex) b.classList.add("wrong");
    b.disabled = true;
  });

  const correct = (i === q.answerIndex);

  markSeen(q);
  recordResult(q, correct);

  if(state.mode === "quiz" && correct) state.score += 1;

  $("explain").textContent = q.explanation || "";
  $("nextBtn").disabled = false;
  $("revealBtn").disabled = true;

  setStatus(correct ? "✅ Correct" : "❌ Not quite");
  updateQuizUI();
}

function reveal(){
  if(state.answered) return;

  const q = state.activeQ;
  state.answered = true;

  const buttons = [...document.querySelectorAll(".choice")];
  buttons.forEach((b, idx)=>{
    if(idx === q.answerIndex) b.classList.add("correct");
    b.disabled = true;
  });

  markSeen(q);
  recordResult(q, false);

  $("explain").textContent = q.explanation || "";
  $("nextBtn").disabled = false;
  $("revealBtn").disabled = true;

  setStatus("👀 Revealed");
  updateQuizUI();
}

function next(){
  if(!state.running) return;
  state.idx += 1;
  renderQuestion();
}

function finish(){
  state.running = false;
  $("revealBtn").disabled = true;
  $("nextBtn").disabled = true;

  const total = state.deck.length;
  const pct = total ? Math.round((state.score/total)*100) : 0;

  $("questionArea").innerHTML = `
    <div class="q">Done 🎉</div>
    <p class="sub">Score: <b>${state.score}</b> / ${total} (${pct}%)</p>
    <div style="height:10px"></div>
    <button class="btn" id="restartBtn">Restart</button>
    <button class="btn ghost" id="homeBtn">Back to home</button>
  `;

  $("bar").style.width = "100%";
  setStatus("Finished");

  $("restartBtn").addEventListener("click", ()=> start(state.topic));
  $("homeBtn").addEventListener("click", ()=> showTab("home"));
}

function buildDeckForMode(topic){
  const mode = $("modeSelect").value;
  const limit = parseInt($("limitSelect").value, 10);
  const pack = $("packSelect").value;
  const sub = $("subtopicSelect").value;

  let all = packFilter(BANK.filter(q => q.topic === topic), pack);
  if(sub) all = all.filter(q => q.subtopic === sub);

  const t = ensureTopicRecord(topic);
  const wrongMap = t.wrongIds || {};
  const seenMap = t.seenIds || {};

  if(mode === "quiz" || mode === "practice"){
    const deck = shuffle(all);
    return limit >= 999 ? deck : deck.slice(0, Math.min(limit, deck.length));
  }

  if(mode === "weak"){
    const weights = all.map(q => 1 + (wrongMap[qId(q)] ?? 0) * 3);
    const picked = weightedPick(all, weights, limit >= 999 ? all.length : limit);
    return picked.length ? picked : shuffle(all).slice(0, Math.min(limit, all.length));
  }

  // spaced
  const weights = all.map(q => {
    const wrong = (wrongMap[qId(q)] ?? 0);
    const seen = (seenMap[qId(q)] ?? 0);
    return 1 + wrong * 4 + Math.max(0, 3 - seen);
  });

  const picked = weightedPick(all, weights, limit >= 999 ? all.length : limit);
  return picked.length ? picked : shuffle(all).slice(0, Math.min(limit, all.length));
}

function start(topic){
  state.mode = $("modeSelect").value;
  state.topic = topic;
  state.pack = $("packSelect").value || "Y2: Long-term conditions";
  state.deck = buildDeckForMode(topic);
  state.idx = 0;
  state.score = 0;
  state.running = true;

  showTab("quiz");
  renderQuestion();
}

/* ========= Stats page ========= */
function renderStats(){
  const topics = Object.keys(progress.topics);
  const rows = topics.map(t => {
    const st = topicStats(t);
    return { topic:t, answered:st.answered, accuracy:st.accuracy };
  });

  rows.sort((a,b)=> (a.accuracy - b.accuracy) || (b.answered - a.answered));

  // Weakest topics list
  const weak = rows.filter(r => r.answered >= 5).slice(0, 8);
  $("weakTopics").innerHTML = weak.length
    ? weak.map(r => `<div class="barRow"><div class="barLabel">${r.topic}</div><div class="barOuter"><div class="barInner" style="width:${r.accuracy}%"></div></div><div class="barPct">${r.accuracy}%</div></div>`).join("")
    : `<div class="note muted">Answer at least 5 questions in a topic to see “weakest topics”.</div>`;

  // Accuracy bars for all topics
  const all = rows.sort((a,b)=> a.topic.localeCompare(b.topic));
  $("topicBars").innerHTML = all.length
    ? all.map(r => `<div class="barRow"><div class="barLabel">${r.topic}</div><div class="barOuter"><div class="barInner" style="width:${r.accuracy}%"></div></div><div class="barPct">${r.accuracy}%</div></div>`).join("")
    : `<div class="note muted">No data yet. Start a quiz to generate stats.</div>`;
}

/* ========= Tools: ABG checker ========= */
function parseNum(x){
  const n = Number(String(x).trim());
  return Number.isFinite(n) ? n : null;
}

function interpretABG(ph, co2, hco3){
  // refs: pH 7.35–7.45, CO2 4.7–6.0 kPa, HCO3 22–26
  const phLow = ph < 7.35, phHigh = ph > 7.45;
  const co2High = co2 > 6.0, co2Low = co2 < 4.7;
  const hco3High = hco3 > 26, hco3Low = hco3 < 22;

  if(!phLow && !phHigh && !co2High && !co2Low && !hco3High && !hco3Low){
    return "Looks normal overall (within typical reference ranges).";
  }

  // Determine primary by pH direction
  if(phLow){
    // acidaemia
    if(co2High && !hco3Low) return "Respiratory acidosis (likely acute if HCO₃⁻ is normal).";
    if(hco3Low && !co2High) return "Metabolic acidosis (CO₂ may fall if compensating).";
    if(co2High && hco3Low) return "Mixed acidosis (respiratory + metabolic).";
    return "Acidaemia present — pattern unclear (check values/clinical context).";
  }

  if(phHigh){
    // alkalaemia
    if(co2Low && !hco3High) return "Respiratory alkalosis (likely acute if HCO₃⁻ is normal).";
    if(hco3High && !co2Low) return "Metabolic alkalosis (CO₂ may rise if compensating).";
    if(co2Low && hco3High) return "Mixed alkalosis (respiratory + metabolic).";
    return "Alkalaemia present — pattern unclear (check values/clinical context).";
  }

  // pH normal but CO2/HCO3 abnormal => compensated or mixed
  if(co2High && hco3High) return "Compensated respiratory acidosis (chronic/compensated pattern).";
  if(co2Low && hco3Low) return "Compensated respiratory alkalosis (chronic/compensated pattern).";
  if(hco3High && co2High) return "Compensated metabolic alkalosis pattern (consider full ABG).";
  if(hco3Low && co2Low) return "Compensated metabolic acidosis pattern (consider full ABG).";
  return "Possible compensation — interpret with clinical context and full ABG."
}

/* ========= Wiring ========= */
function resetProgress(){
  progress = defaultProgress();
  saveProgress(progress);
  updateHeaderStats();
  renderTopics();
  renderStats();
}

function init(){
  // default pack: LTC
  $("packSelect").value = "Y2: Long-term conditions";

  renderSubtopicSelect();
  updateHeaderStats();
  renderTopics();

  $("packSelect").addEventListener("change", ()=>{
    renderSubtopicSelect();
    renderTopics();
  });

  $("subtopicSelect").addEventListener("change", renderTopics);
  $("searchInput").addEventListener("input", renderTopics);
  $("modeSelect").addEventListener("change", renderTopics);

  $("backBtn").addEventListener("click", ()=> showTab("home"));
  $("nextBtn").addEventListener("click", next);
  $("revealBtn").addEventListener("click", reveal);
  $("resetProgressBtn").addEventListener("click", resetProgress);

  // Tools
  $("abgBtn").addEventListener("click", ()=>{
    const ph = parseNum($("abgPH").value);
    const co2 = parseNum($("abgCO2").value);
    const hco3 = parseNum($("abgHCO3").value);
    if(ph===null || co2===null || hco3===null){
      $("abgOut").textContent = "Enter valid numbers for pH, PaCO₂ (kPa), and HCO₃⁻.";
      return;
    }
    $("abgOut").textContent = interpretABG(ph, co2, hco3);
  });

  $("openWeakBtn").addEventListener("click", ()=>{
    $("modeSelect").value = "weak";
    showTab("home");
    renderTopics();
  });

  // start on Home
  showTab("home");
}

init();
