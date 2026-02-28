const $ = (id) => document.getElementById(id);

const BANK = window.QUESTION_BANK ?? [];
const STORAGE_KEY = "anatomyQuizProgress_v1";

const defaultProgress = () => ({
  overall: { answered: 0, correct: 0, streak: 0, lastDay: null },
  topics: {} // topic -> { answered, correct, wrongIds: {id:count}, seenIds: {id:count} }
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
  // stable id: topic|question text
  return `${q.topic}||${q.q}`;
}

function uniqueTopics(){
  return [...new Set(BANK.map(q => q.topic))].sort();
}

function topicStats(topic, prog){
  const t = prog.topics[topic] || { answered:0, correct:0, wrongIds:{}, seenIds:{} };
  const acc = t.answered ? Math.round((t.correct/t.answered)*100) : 0;
  return { ...t, accuracy: acc };
}

function overallStats(prog){
  const o = prog.overall;
  const acc = o.answered ? Math.round((o.correct/o.answered)*100) : 0;
  return { ...o, accuracy: acc };
}

let progress = loadProgress();

let state = {
  running:false,
  mode:"quiz",
  topic:null,
  deck:[],
  idx:0,
  score:0,
  answered:false,
  activeQ:null,
};

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// weighted selection: wrong questions appear more often in weak/spaced
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

function ensureTopicRecord(topic){
  if(!progress.topics[topic]){
    progress.topics[topic] = { answered:0, correct:0, wrongIds:{}, seenIds:{} };
  }
  return progress.topics[topic];
}

function updateHeaderStats(){
  const o = overallStats(progress);
  $("statStreak").textContent = o.streak;
  $("statAccuracy").textContent = `${o.accuracy}%`;
  $("statAnswered").textContent = o.answered;
  $("statTopics").textContent = uniqueTopics().length;
}

function buildTopicCard(topic){
  const st = topicStats(topic, progress);
  const totalQs = BANK.filter(q => q.topic === topic).length;
  const weakness = st.answered ? (100 - st.accuracy) : 100;

  const accPillClass = st.answered
    ? (st.accuracy >= 75 ? "good" : st.accuracy >= 50 ? "" : "bad")
    : "soft";

  const div = document.createElement("div");
  div.className = "card topic";
  div.innerHTML = `
    <div class="head">
      <div>
        <div class="name">${topic}</div>
        <div class="mini">${totalQs} questions • Weakness score: ${weakness}</div>
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

  const query = $("searchInput").value.trim().toLowerCase();
  const sort = $("sortSelect").value;

  let topics = uniqueTopics().filter(t => t.toLowerCase().includes(query));

  topics.sort((a,b)=>{
    const sa = topicStats(a, progress);
    const sb = topicStats(b, progress);
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

  topics.forEach(t => grid.appendChild(buildTopicCard(t)));
}

function showHome(){
  state.running = false;
  $("homeSection").classList.remove("hidden");
  $("quizSection").classList.add("hidden");
  renderTopics();
  updateHeaderStats();
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
}

function setStatus(text){
  $("statusPill").textContent = text;
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

  $("questionArea").innerHTML = `
    <div class="q">${q.q}</div>
    <div class="choices">
      ${q.choices.map((c,i)=>`<button class="choice" data-i="${i}">${c}</button>`).join("")}
    </div>
    <div class="explain" id="explain"></div>
  `;

  document.querySelectorAll(".choice").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      choose(parseInt(btn.dataset.i,10));
    });
  });

  updateQuizUI();
}

function markSeen(q){
  const id = qId(q);
  const t = ensureTopicRecord(q.topic);
  t.seenIds[id] = (t.seenIds[id] ?? 0) + 1;
}

function recordResult(q, correct){
  const id = qId(q);
  const day = todayKey();

  // topic stats
  const t = ensureTopicRecord(q.topic);
  t.answered += 1;
  if(correct) t.correct += 1;

  // wrong tracking for adaptive modes
  if(!correct){
    t.wrongIds[id] = (t.wrongIds[id] ?? 0) + 1;
  } else {
    // optional: decay wrong count slowly on correct
    if(t.wrongIds[id]) t.wrongIds[id] = Math.max(0, t.wrongIds[id]-1);
    if(t.wrongIds[id] === 0) delete t.wrongIds[id];
  }

  // overall stats
  progress.overall.answered += 1;
  if(correct) progress.overall.correct += 1;

  // streak logic (daily)
  const last = progress.overall.lastDay;
  if(last === day){
    // same day, streak unchanged
  } else {
    // if yesterday, keep streak; else reset
    const lastDate = last ? new Date(last + "T00:00:00") : null;
    const now = new Date(day + "T00:00:00");
    const diffDays = lastDate ? Math.round((now - lastDate)/(1000*60*60*24)) : 999;

    if(diffDays === 1) progress.overall.streak += 1;
    else progress.overall.streak = 1;

    progress.overall.lastDay = day;
  }

  saveProgress(progress);
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
  // Reveals don’t count toward score; but we *do* treat it as wrong for training pressure.
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
  const all = BANK.filter(q => q.topic === topic);

  // ensure topic record exists for adaptive modes
  const t = ensureTopicRecord(topic);
  const wrongMap = t.wrongIds || {};

  if(mode === "quiz" || mode === "practice"){
    const deck = shuffle(all);
    return limit >= 999 ? deck : deck.slice(0, Math.min(limit, deck.length));
  }

  if(mode === "weak"){
    // weight by wrong count (missed more => appears more)
    const weights = all.map(q => 1 + (wrongMap[qId(q)] ?? 0) * 3);
    const picked = weightedPick(all, weights, limit >= 999 ? all.length : limit);
    return picked.length ? picked : shuffle(all).slice(0, Math.min(limit, all.length));
  }

  if(mode === "spaced"){
    // spaced review: prioritize wrong + less seen
    const seenMap = t.seenIds || {};
    const weights = all.map(q => {
      const wrong = (wrongMap[qId(q)] ?? 0);
      const seen = (seenMap[qId(q)] ?? 0);
      // more wrong => more weight; less seen => more weight
      return 1 + wrong * 4 + Math.max(0, 3 - seen);
    });
    const picked = weightedPick(all, weights, limit >= 999 ? all.length : limit);
    return picked.length ? picked : shuffle(all).slice(0, Math.min(limit, all.length));
  }

  return shuffle(all);
}

function start(topic){
  state.mode = $("modeSelect").value;
  state.topic = topic;
  state.deck = buildDeckForMode(topic);
  state.idx = 0;
  state.score = 0;
  state.running = true;

  $("quizTitle").textContent = `${topic}`;
  showQuiz();
  renderQuestion();
}

function resetProgress(){
  progress = defaultProgress();
  saveProgress(progress);
  showHome();
}

function init(){
  // optional: make "Repo" button try to point to current location (best-effort)
  $("githubHint").addEventListener("click", (e)=>{
    // If you want, replace this with your repo URL
    // e.g. https://github.com/YourUserName/anatomy-quizzes
    if($("githubHint").getAttribute("href") === "#"){
      e.preventDefault();
      alert("Set your repo link in index.html (the Repo button).");
    }
  });

  $("backBtn").addEventListener("click", showHome);
  $("nextBtn").addEventListener("click", next);
  $("revealBtn").addEventListener("click", reveal);
  $("resetProgressBtn").addEventListener("click", resetProgress);

  $("searchInput").addEventListener("input", renderTopics);
  $("sortSelect").addEventListener("change", renderTopics);
  $("modeSelect").addEventListener("change", renderTopics);

  updateHeaderStats();
  renderTopics();
}
init();
