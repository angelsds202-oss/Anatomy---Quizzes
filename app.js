const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "nmcQuizProgress_v3";

// Gather all questions
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
  // stable id includes key fields
  return `${q.pack||""}||${q.topic||""}||${q.subtopic||""}||${q.q||""}`;
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
function uniquePacks(qs){
  const base = [...new Set(qs.map(q => q.pack).filter(Boolean))].sort();
  // Add curated virtual packs
  return [
    "Year 2 (default)",
    "Mixed Revision (Y2)",
    "Safety Only",
    "All packs",
    ...base.filter(p => !["Year 2","Safety: Deterioration","Safety: Medicines","Safety: Infection"].includes(p))
  ];
}

function packFilter(qs, pack){
  if(!pack || pack === "All packs") return qs;

  if(pack === "Year 2 (default)") {
    return qs.filter(q => q.pack === "Year 2" || (q.pack || "").startsWith("Safety:"));
  }
  if(pack === "Mixed Revision (Y2)") {
    // Year 2 + safety + some Year 1 foundations
    return qs.filter(q => q.pack === "Year 2" || q.pack === "Year 1" || (q.pack || "").startsWith("Safety:"));
  }
  if(pack === "Safety Only") {
    return qs.filter(q => (q.pack || "").startsWith("Safety:"));
  }
  // direct match fallback
  return qs.filter(q => q.pack === pack);
}

function applyFilters(){
  const pack = $("packSelect").value;
  const sub = $("subtopicSelect").value;
  const query = $("searchInput").value.trim().toLowerCase();

  let qs = packFilter(BANK, pack);

  if(sub){
    qs = qs.filter(q => q.subtopic === sub);
  }
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

function renderPackSelect(){
  const packs = uniquePacks(BANK);
  $("packSelect").innerHTML = packs.map(p => `<option value="${p}">${p}</option>`).join("");
  // Default to Year 2 pack if not already set
  if(!$("packSelect").value) $("packSelect").value = "Year 2 (default)";
}

function renderSubtopicSelect(){
  const pack = $("packSelect").value;
  const filteredForPack = packFilter(BANK, pack);
  const subs = uniqueSubtopics(filteredForPack);

  const current = $("subtopicSelect").value;
  $("subtopicSelect").innerHTML =
    `<option value="">All subtopics</option>` +
    subs.map(s => `<option value="${s}">${s}</option>`).join("");

  if(current && subs.includes(current)) $("subtopicSelect").value = current;
}

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
        <div class="mini">${totalQs} questions • Y2 focus</div>
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
  let topics = uniqueTopics(qs);
  const sort = $("sortSelect").value;

  topics.sort((a,b)=>{
    const sa = topicStats(a);
    const sb = topicStats(b);
    if(sort === "name") return a.localeCompare(b);
    if(sort === "weakest"){
      const wa = sa.answered ? sa.correct/sa.answered : 0;
      const wb = sb.answered ? sb.correct/sb.answered : 0;
      return wa - wb;
    }
    if(sort === "mostAnswered"){
      return (sb.answered ?? 0) - (sa.answered ?? 0);
    }
    return a.localeCompare(b);
  });

  topics.forEach(t => {
    const qsInTopic = qs.filter(q => q.topic === t);
    grid.appendChild(buildTopicCard(t, qsInTopic));
  });

  updateHeaderStats();
}

let state = {
  running:false,
  mode:"quiz",
  topic:null,
  deck:[],
  idx:0,
  score:0,
  answered:false,
  activeQ:null,
  pack:"Year 2 (default)"
};

function showHome(){
  state.running = false;
  $("homeSection").classList.remove("hidden");
  $("quizSection").classList.add("hidden");
  renderSubtopicSelect();
  renderTopics();
}
function showQuiz(){
  $("homeSection").classList.add("hidden");
  $("quizSection").classList.remove("hidden");
}

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
  $("homeBtn").addEventListener("click", showHome);
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
  state.pack = $("packSelect").value || "Year 2 (default)";
  state.deck = buildDeckForMode(topic);
  state.idx = 0;
  state.score = 0;
  state.running = true;

  showQuiz();
  renderQuestion();
}

function resetProgress(){
  progress = defaultProgress();
  saveProgress(progress);
  showHome();
}

function init(){
  renderPackSelect();
  // Force default pack to Y2 for you
  $("packSelect").value = "Year 2 (default)";

  renderSubtopicSelect();
  updateHeaderStats();
  renderTopics();

  $("packSelect").addEventListener("change", ()=>{ renderSubtopicSelect(); renderTopics(); });
  $("subtopicSelect").addEventListener("change", renderTopics);
  $("searchInput").addEventListener("input", renderTopics);
  $("sortSelect").addEventListener("change", renderTopics);
  $("modeSelect").addEventListener("change", renderTopics);

  $("backBtn").addEventListener("click", showHome);
  $("nextBtn").addEventListener("click", next);
  $("revealBtn").addEventListener("click", reveal);
  $("resetProgressBtn").addEventListener("click", resetProgress);
}
init();
