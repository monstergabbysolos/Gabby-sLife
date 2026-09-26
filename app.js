/* =====================================================================
   LifeOS — personal dashboard, gamified. Encrypted vault, no backend.
   ===================================================================== */
'use strict';

/* ---------------- constants ---------------- */
const ATTRS = {
  STR: { name: 'Strength',   color: '#ff1f3d', icon: '💪' },
  INT: { name: 'Intellect',  color: '#ffe81a', icon: '🧠' },
  VIT: { name: 'Vitality',   color: '#c6ff1a', icon: '❤️' },
  DIS: { name: 'Discipline', color: '#ff8a1a', icon: '🛡️' },
  CRE: { name: 'Creativity', color: '#f2f2f2', icon: '✨' },
};
const RANKS = ['Novice','Apprentice','Adept','Specialist','Expert','Veteran','Master','Grandmaster','Legend','Mythic'];
const THEMES = {
  forest: { a1: '#b5f35a', a2: '#e4ffa6', a3: '#5ee0a6', ok: '#b5f35a', warn: '#ffc857', bad: '#ff6b6b', bg: '#0d1411', white: '#f4ffe6',
    attr: { STR: '#ffa35c', INT: '#6fd8ff', VIT: '#b5f35a', DIS: '#c7a8ff', CRE: '#ffe07a' },
    series: ['#b5f35a', '#6fd8ff', '#ffa35c', '#c7a8ff', '#ffe07a', '#5ee0a6'],
    confetti: ['#b5f35a', '#e4ffa6', '#b5f35a', '#ffffff', '#5ee0a6', '#e4ffa6'],
    week: t => `hsla(${95 - t * 10},${75 + t * 10}%,${46 + t * 18}%,${0.55 + t * 0.45})` },
  livery: { a1: '#ff1f3d', a2: '#ffe81a', a3: '#ff6a00', ok: '#c6ff1a', warn: '#ffb000', bad: '#ff3355', bg: '#0a0a0a', white: '#ffffff',
    attr: { STR: '#ff1f3d', INT: '#ffe81a', VIT: '#c6ff1a', DIS: '#ff8a1a', CRE: '#f2f2f2' },
    series: ['#ff1f3d', '#ff6a00', '#ffe81a', '#ffb000', '#c6ff1a', '#ff1f3d'],
    confetti: ['#ff1f3d', '#ffe81a', '#ff1f3d', '#ffe81a', '#ff6a00', '#ffffff'],
    week: t => `hsl(${(352 + t * 62) % 360},100%,${54 + t * 4}%)` },
};
let THEME = 'forest', TH = THEMES.forest;
const PRIO = {};
function applyTheme(name) {
  THEME = THEMES[name] ? name : 'forest'; TH = THEMES[THEME];
  document.documentElement.dataset.theme = THEME;
  Object.keys(ATTRS).forEach(k => ATTRS[k].color = TH.attr[k]);
  Object.assign(PRIO, { high: TH.bad, med: TH.warn, low: THEME === 'forest' ? TH.attr.INT : TH.a2 });
  $('meta[name=theme-color]')?.setAttribute('content', THEME === 'forest' ? '#070b09' : '#030303');
  try { localStorage.setItem('lifeos.theme', THEME); } catch {}
  if (THEME === 'forest') { buildForest(); flies.start(); } else flies.stop();
}
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ITER = 310000;
const LS_VAULT = 'lifeos.vault', LS_GH = 'lifeos.gh';

const I = { // icons (24px stroke)
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  tasks:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 12l3 3 5-6"/>',
  map:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  vault:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7M12 17v-1.5M8.5 12H7M17 12h-1.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>', check:'<path d="M5 12l5 5 9-10"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  up:'<path d="M12 19V5M5 12l7-7 7 7"/>', down:'<path d="M12 5v14M5 12l7 7 7-7"/>',
  cloud:'<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8"/><path d="M12 12v9M9 15l3-3 3 3"/>',
  spark:'<path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', flame:'<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8 0 4 3 7 7 7z"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  chef:'<path d="M6 14a4 4 0 1 1 1.5-7.7A4.5 4.5 0 0 1 16.5 6.3 4 4 0 1 1 18 14v6H6z"/><path d="M6 17h12"/>',
  radar:'<path d="M12 3l8.5 6.2-3.2 10H6.7L3.5 9.2z"/><path d="M12 8l4 3-1.5 5h-5L8 11z"/>',
};
const icon = (n, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;

const VIEWS = [
  ['home','Home','home'], ['goals','Goals','target'], ['health','Health','heart'], ['gym','Gym','dumbbell'], ['meals','Meals','chef'],
  ['tasks','Tasks','tasks'], ['journey','Journey','map'], ['trophies','Trophies','trophy'], ['vault','Vault','vault'],
];

/* ---------------- tiny helpers ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => dkey(new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
function pdate(s) { // accepts YYYY, YYYY-MM, YYYY-MM-DD, full ISO
  if (!s) return null;
  if (/^\d{4}$/.test(s)) return new Date(+s, 0, 1);
  if (/^\d{4}-\d{2}$/.test(s)) { const [y, m] = s.split('-'); return new Date(+y, +m - 1, 1); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const [y, m, d] = s.split('-'); return new Date(+y, +m - 1, +d); }
  const d = new Date(s); return isNaN(d) ? null : d;
}
const daysBetween = (a, b) => Math.round((pdate(dkey(b)) - pdate(dkey(a))) / 864e5);
function fmtDate(s, long = false) {
  const d = pdate(s); if (!d) return 'Date TBD';
  if (/^\d{4}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return d.toLocaleDateString(undefined, long ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' });
}
function rel(s) {
  const d = pdate(s); if (!d) return '';
  const n = daysBetween(new Date(), d);
  if (n === 0) return 'today'; if (n === 1) return 'tomorrow'; if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n}d` : `${-n}d ago`;
}
const fmt = (n, d = 0) => Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

/* ---------------- crypto vault ---------------- */
const te = new TextEncoder(), td = new TextDecoder();
function b64(buf) { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s) { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
async function deriveKey(pass, salt, iter = ITER) {
  const km = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptWith(key, salt, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)));
  return { app: 'lifeos', v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
async function decryptWith(key, blob) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.ct));
  return JSON.parse(td.decode(pt));
}
const validBlob = b => b && b.app === 'lifeos' && b.ct && b.iv && b.salt;

/* IndexedDB: remembers a NON-extractable key on this device */
const idb = {
  db() { return new Promise((res, rej) => { const r = indexedDB.open('lifeos', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async get(k) { try { const db = await this.db(); return await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); } catch { return null; } },
  async set(k, v) { try { const db = await this.db(); await new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = res; }); } catch {} },
  async del(k) { try { const db = await this.db(); await new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = res; t.onerror = res; }); } catch {} },
};
const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

/* ---------------- state ---------------- */
let DATA = null, KEY = null, SALT = null, GH = null;
let VIEW = 'home', S = null; // S = computed stats
let ui = { metric: null, taskFilter: 'open', mood: null };
let saveTimer = null, tickRAF = null;

/* ---------------- sample data (clearly flagged as demo) ---------------- */
function makeDemo() {
  const t = new Date(), k = n => dkey(addDays(t, n));
  const quests = [
    { id: 'gym',   title: 'Train (gym session)',     icon: '🏋️', attr: 'STR', xp: 30 },
    { id: 'water', title: 'Drink 3L water',          icon: '💧', attr: 'VIT', xp: 10 },
    { id: 'sleep', title: 'Sleep 7h+',               icon: '🌙', attr: 'VIT', xp: 15 },
    { id: 'study', title: '2h deep work / study',    icon: '📚', attr: 'INT', xp: 25 },
    { id: 'read',  title: 'Read 20 pages',           icon: '📖', attr: 'INT', xp: 10 },
    { id: 'write', title: 'Write 500 words',         icon: '✍️', attr: 'CRE', xp: 20 },
    { id: 'wake',  title: 'Up by 6:30',              icon: '⏰', attr: 'DIS', xp: 15 },
    { id: 'clean', title: 'Hit protein, no junk',    icon: '🥗', attr: 'DIS', xp: 10 },
  ];
  // pseudo-random but stable history
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const log = {};
  for (let i = 60; i >= 1; i--) {
    const q = {}; const p = i < 12 ? 0.82 : 0.58;
    quests.forEach(x => { if (rnd() < p) q[x.id] = true; });
    log[k(-i)] = { q, sleepH: +(6 + rnd() * 2.2).toFixed(1), waterL: +(1.8 + rnd() * 1.6).toFixed(1), mood: ['😄','🙂','😐','🙂','😄'][Math.floor(rnd() * 5)] };
  }
  log[k(0)] = { q: { wake: true, water: true } };
  const split = [
    { dow: 1, name: 'Push A', exercises: [['Bench Press',4,'6-8',60],['Overhead Press',3,'8-10',35],['Incline DB Press',3,'10',22],['Lateral Raise',4,'15',8],['Triceps Pushdown',3,'12',25]] },
    { dow: 2, name: 'Pull A', exercises: [['Deadlift',3,'5',100],['Pull-ups',4,'AMRAP',0],['Barbell Row',3,'8',55],['Face Pull',3,'15',20],['Barbell Curl',3,'10',25]] },
    { dow: 3, name: 'Legs A', exercises: [['Back Squat',4,'6-8',80],['Romanian Deadlift',3,'10',70],['Leg Press',3,'12',140],['Calf Raise',4,'15',60]] },
    { dow: 4, name: 'Push B', exercises: [['Overhead Press',4,'6-8',37.5],['Incline Bench',3,'8',50],['Cable Fly',3,'12',15],['Lateral Raise',4,'15',8],['Dips',3,'10',0]] },
    { dow: 5, name: 'Pull B', exercises: [['Weighted Pull-ups',4,'6',10],['Lat Pulldown',3,'10',55],['Seated Row',3,'12',50],['Rear Delt Fly',3,'15',6],['Hammer Curl',3,'12',14]] },
    { dow: 6, name: 'Legs B', exercises: [['Front Squat',4,'8',60],['Hip Thrust',3,'10',80],['Leg Curl',3,'12',40],['Walking Lunge',3,'12',16]] },
    { dow: 0, name: 'Rest', exercises: [] },
  ].map(d => ({ ...d, exercises: d.exercises.map(([name, sets, reps, weight]) => ({ name, sets, reps, weight })) }));
  const logs = [];
  for (let i = 56; i >= 1; i--) {
    const d = addDays(t, -i), day = split.find(s => s.dow === d.getDay());
    if (!day.exercises.length || rnd() < 0.2) continue;
    const prog = 1 + (56 - i) / 56 * 0.1;
    logs.push({ date: dkey(d), day: day.name, sets: day.exercises.flatMap(e => Array.from({ length: e.sets }, () => ({ ex: e.name, w: Math.round(e.weight * prog * 2) / 2, r: parseInt(e.reps) || 8 }))) });
    if (log[dkey(d)]) log[dkey(d)].q.gym = true;
  }
  const wEntries = []; for (let i = 12; i >= 0; i--) wEntries.push({ date: k(-i * 7), value: +(70.5 + (12 - i) * 0.18 + (rnd() - .5) * .5).toFixed(1) });
  return {
    version: 1,
    meta: { demo: true, created: Date.now(), updatedAt: Date.now(), lastLevel: 0, seenAch: null },
    profile: {
      name: 'Joe', avatar: '🧑‍🚀', photo: '', dob: '2000-01-01T00:00', lifeYears: 80, heightCm: 175,
      tagline: 'Engineer · Novelist · Builder — Robotics MSc @ NTU',
      location: 'Singapore (from Chennai)', status: { emoji: '🚀', text: 'Locked in — new chapter in Singapore' },
      tags: ['ESP32 / IoT', 'Flutter', 'AI/ML', 'Web', 'Fiction', 'Film'],
    },
    goals: [
      { id: uid(), title: 'Ace MSc Robotics & Intelligent Systems', category: 'Education', attr: 'INT', start: '2026-08-01', due: '2027-07-31', progress: 0,
        milestones: [{ t: 'Settle into NTU & Singapore', done: true }, { t: 'Semester 1 exams', done: false }, { t: 'Choose dissertation topic', done: false }, { t: 'Submit dissertation', done: false }] },
      { id: uid(), title: 'V-taper physique', category: 'Fitness', attr: 'STR', start: '2026-06-01', due: '2027-03-01', progress: 0,
        milestones: [{ t: 'Bench 70kg × 5', done: false }, { t: '10 strict pull-ups', done: true }, { t: 'Lean bulk to 74kg', done: false }] },
      { id: uid(), title: 'Write novel #2 (first draft)', category: 'Creative', attr: 'CRE', start: '2026-07-01', due: '2027-06-30', progress: 18, milestones: [] },
      { id: uid(), title: 'Ship FaithQuest v1', category: 'Build', attr: 'CRE', start: '2026-05-01', due: '2026-12-31', progress: 55, milestones: [] },
    ],
    health: {
      metrics: [
        { key: 'weight', label: 'Weight', unit: 'kg', target: 74, better: 'target', entries: wEntries },
        { key: 'rhr', label: 'Resting HR', unit: 'bpm', target: 60, better: 'lower', entries: [{ date: k(-60), value: 72 }, { date: k(-30), value: 69 }, { date: k(-7), value: 66 }] },
        { key: 'bf', label: 'Body fat', unit: '%', target: 13, better: 'lower', entries: [{ date: k(-60), value: 18.5 }, { date: k(-30), value: 17.6 }, { date: k(-5), value: 16.9 }] },
        { key: 'bp', label: 'BP systolic', unit: 'mmHg', target: 120, better: 'lower', entries: [{ date: k(-45), value: 124 }, { date: k(-10), value: 119 }] },
      ],
      reports: [
        { id: uid(), date: k(-40), title: 'Annual blood panel (sample)', notes: 'Replace with your real report values.', markers: [
          { name: 'Hemoglobin', value: 14.6, unit: 'g/dL', min: 13.5, max: 17.5 },
          { name: 'Vitamin D', value: 21, unit: 'ng/mL', min: 30, max: 100 },
          { name: 'Vitamin B12', value: 380, unit: 'pg/mL', min: 200, max: 900 },
          { name: 'Fasting glucose', value: 88, unit: 'mg/dL', min: 70, max: 100 },
          { name: 'LDL', value: 104, unit: 'mg/dL', min: 0, max: 100 },
          { name: 'TSH', value: 2.1, unit: 'mIU/L', min: 0.4, max: 4.0 },
        ] },
      ],
    },
    gym: { split, logs },
    routine: [
      { time: '06:15', label: 'Wake · water · stretch', icon: '🌅' }, { time: '07:00', label: 'Gym', icon: '🏋️' },
      { time: '09:00', label: 'Lectures / lab @ NTU', icon: '🎓' }, { time: '13:00', label: 'Lunch', icon: '🍛' },
      { time: '14:00', label: 'Deep work · projects', icon: '🔧' }, { time: '18:30', label: 'Dinner', icon: '🍽️' },
      { time: '19:30', label: 'Study / research', icon: '📚' }, { time: '21:30', label: 'Writing hour', icon: '✍️' },
      { time: '22:45', label: 'Wind down · read', icon: '📖' }, { time: '23:15', label: 'Sleep', icon: '🌙' },
    ],
    quests,
    log,
    activity: [{ t: Date.now() - 2 * 36e5, icon: '💧', text: 'Quest done: Drink 3L water' }, { t: Date.now() - 5 * 36e5, icon: '⏰', text: 'Quest done: Up by 6:30' }],
    tasks: [
      { id: uid(), title: 'Finalise room rental near NTU', due: k(2), prio: 'high', attr: 'DIS', xp: 30, done: false },
      { id: uid(), title: 'Read robotics kinematics ch. 3', due: k(1), prio: 'med', attr: 'INT', xp: 20, done: false },
      { id: uid(), title: 'Push portfolio site update', due: k(5), prio: 'low', attr: 'CRE', xp: 20, done: false },
      { id: uid(), title: 'Book blood test (Vit D recheck)', due: k(10), prio: 'med', attr: 'VIT', xp: 15, done: false },
      { id: uid(), title: 'Open Singapore bank account', due: k(-3), prio: 'high', attr: 'DIS', xp: 25, done: true, doneAt: k(-3) },
      { id: uid(), title: 'Set up ESP32 cyberdeck display', due: k(-6), prio: 'low', attr: 'CRE', xp: 25, done: true, doneAt: k(-5) },
    ],
    journey: [
      { id: uid(), date: '', title: 'Published debut thriller novel', desc: 'From idea to published book.', icon: '📕' },
      { id: uid(), date: '', title: 'Built IGCAR ovality instrument', desc: 'Handheld pipe-bend ovality measurement for IGCAR Kalpakkam.', icon: '📐' },
      { id: uid(), date: '', title: 'Dental implant tissue probe', desc: 'ESP32 touch-sensing bone vs gum detection.', icon: '🦷' },
      { id: uid(), date: '2026-08', title: 'Moved to Singapore · NTU MSc begins', desc: 'Robotics & Intelligent Systems.', icon: '✈️' },
      { id: uid(), date: '2027-07', title: 'MSc graduation', desc: 'The next level.', icon: '🎓' },
    ],
  };
}

/* ---------------- stats engine ---------------- */
const levelCum = L => 50 * L * (L - 1);           // total XP needed to reach level L (L2=100, L10=4500)
const levelOf = xp => { let L = 1; while (levelCum(L + 1) <= xp) L++; return L; };
const rankOf = L => RANKS[Math.min(RANKS.length - 1, Math.floor((L - 1) / 5))];
const attrLevel = xp => Math.floor(Math.sqrt(xp / 30)) + 1;

const qActive = (q, dk) => !q.days || !q.days.length || q.days.includes(pdate(dk).getDay());
const questsOn = dk => DATA.quests.filter(q => qActive(q, dk));
function goalPct(g) { return g.milestones?.length ? Math.round(g.milestones.filter(m => m.done).length / g.milestones.length * 100) : clamp(+g.progress || 0, 0, 100); }
const e1rm = (w, r) => w * (1 + r / 30);

function compute() {
  const D = DATA, attr = { STR: 0, INT: 0, VIT: 0, DIS: 0, CRE: 0 }, xpDay = {};
  let xp = 0;
  const add = (n, a, day) => { xp += n; attr[a] = (attr[a] || 0) + n; if (day) xpDay[day] = (xpDay[day] || 0) + n; };
  const qmap = Object.fromEntries(D.quests.map(q => [q.id, q]));
  const days = Object.keys(D.log).sort(), dayScore = {};
  let questDone = 0, perfectDays = 0;
  for (const d of days) {
    const l = D.log[d], done = Object.keys(l.q || {}).filter(id => l.q[id] && qmap[id]);
    done.forEach(id => add(qmap[id].xp, qmap[id].attr, d));
    questDone += done.length;
    const act = D.quests.filter(q => qActive(q, d)), dn = act.filter(q => l.q?.[q.id]).length;
    dayScore[d] = act.length ? dn / act.length : 0;
    if (act.length && dn === act.length) { perfectDays++; add(50, 'DIS', d); }
  }
  const tasksDone = D.tasks.filter(t => t.done);
  tasksDone.forEach(t => add(+t.xp || 20, t.attr || 'DIS', t.doneAt));
  D.gym.logs.forEach(l => add(40 + Math.min(40, l.sets.length * 2), 'STR', l.date));
  let msDone = 0, goalsDone = 0;
  D.goals.forEach(g => { const m = (g.milestones || []).filter(x => x.done).length; msDone += m; add(m * 60, g.attr || 'DIS'); if (goalPct(g) >= 100) { goalsDone++; add(300, g.attr || 'DIS'); } });
  let hEntries = 0; D.health.metrics.forEach(m => { hEntries += m.entries.length; add(m.entries.length * 5, 'VIT'); });
  add(D.health.reports.length * 25, 'VIT');

  // streaks (a day "counts" at >= 50% quests)
  const T = todayKey(), counts = d => (dayScore[d] || 0) >= 0.5;
  let streak = 0, cur = counts(T) ? new Date() : addDays(new Date(), -1);
  while (counts(dkey(cur))) { streak++; cur = addDays(cur, -1); }
  let best = 0, run = 0, prev = null;
  for (const d of days) { if (counts(d)) { run = prev && daysBetween(pdate(prev), pdate(d)) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; } else { run = 0; prev = null; } }
  const qStreak = {};
  D.quests.forEach(q => { let n = 0, c = D.log[T]?.q?.[q.id] ? new Date() : addDays(new Date(), -1);
    for (let g = 0; g < 800; g++) { const k = dkey(c); if (!qActive(q, k)) { c = addDays(c, -1); continue; } if (!D.log[k]?.q?.[q.id]) break; n++; c = addDays(c, -1); }
    qStreak[q.id] = n; });
  // meals eaten
  let mealsEaten = 0;
  Object.entries(D.meals?.eaten || {}).forEach(([d, e]) => Object.values(e).forEach(v => { if (v) { mealsEaten++; add(5, 'VIT', d); } }));

  // PRs
  const prs = {};
  D.gym.logs.forEach(l => l.sets.forEach(s => { if (!s.w) return; const v = e1rm(s.w, s.r); if (!prs[s.ex] || v > prs[s.ex].e) prs[s.ex] = { e: v, w: s.w, r: s.r, date: l.date }; }));

  const level = levelOf(xp);
  const st = { xp, attr, xpDay, level, rank: rankOf(level), cur: xp - levelCum(level), need: levelCum(level + 1) - levelCum(level),
    streak, best: Math.max(best, streak), qStreak, dayScore, questDone, perfectDays, tasksDone: tasksDone.length, workouts: D.gym.logs.length,
    msDone, goalsDone, mealsEaten, hEntries, reports: D.health.reports.length, prs, prCount: Object.keys(prs).length };
  st.ach = ACH.map(a => { const [c, t] = a.p(st); return { ...a, cur: Math.min(c, t), target: t, got: c >= t }; });
  return st;
}

const ACH = [
  { id: 'first',   em: '⭐', name: 'First Step',        desc: 'Complete your first quest',       p: s => [s.questDone, 1] },
  { id: 'q100',    em: '💯', name: 'Centurion',         desc: 'Complete 100 quests',             p: s => [s.questDone, 100] },
  { id: 'q500',    em: '🌌', name: 'Quest Machine',     desc: 'Complete 500 quests',             p: s => [s.questDone, 500] },
  { id: 'st3',     em: '🔥', name: 'On a Roll',         desc: '3-day streak',                    p: s => [s.best, 3] },
  { id: 'st7',     em: '⚡', name: 'Week Warrior',      desc: '7-day streak',                    p: s => [s.best, 7] },
  { id: 'st30',    em: '🌋', name: 'Unstoppable',       desc: '30-day streak',                   p: s => [s.best, 30] },
  { id: 'st100',   em: '👑', name: 'Iron Will',         desc: '100-day streak',                  p: s => [s.best, 100] },
  { id: 'pf1',     em: '💎', name: 'Flawless',          desc: 'One perfect day (all quests)',    p: s => [s.perfectDays, 1] },
  { id: 'pf10',    em: '🏆', name: 'Perfectionist',     desc: '10 perfect days',                 p: s => [s.perfectDays, 10] },
  { id: 'gym1',    em: '🏋️', name: 'Iron Initiate',     desc: 'Log your first workout',          p: s => [s.workouts, 1] },
  { id: 'gym25',   em: '🦍', name: 'Gym Rat',           desc: 'Log 25 workouts',                 p: s => [s.workouts, 25] },
  { id: 'gym100',  em: '🗿', name: 'Iron Legend',       desc: 'Log 100 workouts',                p: s => [s.workouts, 100] },
  { id: 'pr10',    em: '📈', name: 'Record Breaker',    desc: 'Set PRs on 10 lifts',             p: s => [s.prCount, 10] },
  { id: 't10',     em: '✅', name: 'Getting Things Done', desc: 'Finish 10 tasks',               p: s => [s.tasksDone, 10] },
  { id: 't50',     em: '⚔️', name: 'Task Slayer',       desc: 'Finish 50 tasks',                 p: s => [s.tasksDone, 50] },
  { id: 'ms5',     em: '🧭', name: 'Pathfinder',        desc: 'Hit 5 goal milestones',           p: s => [s.msDone, 5] },
  { id: 'goal1',   em: '🎯', name: 'Goal Crusher',      desc: 'Complete a goal',                 p: s => [s.goalsDone, 1] },
  { id: 'rep1',    em: '🩺', name: 'Know Thyself',      desc: 'Log a health report',             p: s => [s.reports, 1] },
  { id: 'h30',     em: '📊', name: 'Quantified Self',   desc: 'Log 30 health measurements',      p: s => [s.hEntries, 30] },
  { id: 'meal30',  em: '🍛', name: 'Well Fed',          desc: 'Eat 30 planned meals',            p: s => [s.mealsEaten, 30] },
  { id: 'meal150', em: '👨‍🍳', name: 'Kitchen Commander', desc: 'Eat 150 planned meals',           p: s => [s.mealsEaten, 150] },
  { id: 'lv5',     em: '🌱', name: 'Rising',            desc: 'Reach level 5',                   p: s => [s.level, 5] },
  { id: 'lv10',    em: '🚀', name: 'Double Digits',     desc: 'Reach level 10',                  p: s => [s.level, 10] },
  { id: 'lv25',    em: '🪐', name: 'Elite',             desc: 'Reach level 25',                  p: s => [s.level, 25] },
  { id: 'ren',     em: '🎭', name: 'Renaissance',       desc: 'Every attribute at level 5+',     p: s => [Math.min(...Object.values(s.attr).map(attrLevel)), 5] },
];

/* ---------------- smart insights (rule engine) ---------------- */
function insights() {
  const D = DATA, s = S, out = [], now = new Date(), hr = now.getHours(), T = todayKey();
  const tq = D.log[T]?.q || {}, TQ = questsOn(T), left = TQ.filter(q => !tq[q.id]);
  const pct = TQ.length ? 1 - left.length / TQ.length : 0;
  if (pct === 1) out.push(['💎', 'Perfect day locked in. +50 bonus XP earned.', 'good']);
  else if (hr >= 17 && left.length) out.push(['⏳', `Evening push: ${left.length} quest${left.length > 1 ? 's' : ''} left worth ${left.reduce((a, q) => a + q.xp, 0)} XP.`, 'warn']);
  else if (left.length) out.push(['🎯', `${left.length} quests open today. Next easy win: “${left[0].title}”.`, 'info']);
  if (s.streak >= 3) out.push(['🔥', `${s.streak}-day streak going. Best ever: ${s.best}. Don't break the chain.`, 'good']);
  else if (s.best >= 3 && s.streak === 0) out.push(['🧯', `Streak reset. Your best is ${s.best} days — two quests today restarts it.`, 'warn']);
  const need = s.need - s.cur; out.push(['⚡', `${fmt(need)} XP to level ${s.level + 1}.`, 'info']);
  // goals pace
  D.goals.forEach(g => {
    const a = pdate(g.start), b = pdate(g.due); if (!a || !b) return; const p = goalPct(g); if (p >= 100) return;
    const exp = clamp((now - a) / (b - a) * 100, 0, 100), dl = daysBetween(now, b);
    if (dl >= 0 && dl <= 14) out.push(['📅', `“${g.title}” is due in ${dl}d at ${p}%.`, p < 80 ? 'bad' : 'warn']);
    else if (p + 20 < exp) out.push(['🐢', `“${g.title}” is behind pace (${p}% vs ~${Math.round(exp)}% expected).`, 'warn']);
  });
  // health markers
  const lm = latestMarkers();
  lm.flagged.slice(0, 3).forEach(m => out.push(['🩺', `${m.name} was ${m.value < m.min ? 'below' : 'above'} range (${m.value} ${m.unit}) on ${fmtDate(lm.date, true)}.`, 'bad']));
  // weight trend
  const w = D.health.metrics.find(m => m.key === 'weight');
  if (w && w.entries.length >= 2 && w.target) {
    const e = [...w.entries].sort((a, b) => a.date.localeCompare(b.date)), last = e[e.length - 1], first = e.find(x => daysBetween(pdate(x.date), pdate(last.date)) <= 35) || e[0];
    const wk = daysBetween(pdate(first.date), pdate(last.date)) / 7, rate = wk > 0 ? (last.value - first.value) / wk : 0, gap = w.target - last.value;
    if (Math.abs(gap) < 0.5) out.push(['⚖️', `Weight is on target (${last.value} kg).`, 'good']);
    else if (rate && Math.sign(rate) === Math.sign(gap)) out.push(['⚖️', `Weight trending ${rate > 0 ? '+' : ''}${rate.toFixed(2)} kg/wk → target ${w.target} kg in ~${Math.ceil(Math.abs(gap / rate))} weeks.`, 'good']);
    else out.push(['⚖️', `Weight is moving away from your ${w.target} kg target.`, 'warn']);
  }
  // gym recency
  const lastG = [...D.gym.logs].sort((a, b) => b.date.localeCompare(a.date))[0], plan = todayPlan();
  if (lastG) { const ago = daysBetween(pdate(lastG.date), now); if (ago >= 3) out.push(['🏋️', `${ago} days since your last workout. Today: ${plan?.name || 'train'}.`, 'warn']); }
  // tasks
  const overdue = D.tasks.filter(t => !t.done && t.due && t.due < T).length;
  if (overdue) out.push(['🚨', `${overdue} overdue task${overdue > 1 ? 's' : ''}. Clear one first.`, 'bad']);
  // weakest attribute
  const weak = Object.entries(s.attr).sort((a, b) => a[1] - b[1])[0], wq = TQ.find(q => q.attr === weak[0] && !tq[q.id]);
  if (wq) out.push([ATTRS[weak[0]].icon, `${ATTRS[weak[0]].name} is your lowest stat. “${wq.title}” boosts it.`, 'info']);
  // sleep avg
  const sl = Object.entries(D.log).filter(([d, l]) => l.sleepH && daysBetween(pdate(d), now) <= 7).map(([, l]) => l.sleepH);
  if (sl.length >= 3) { const avg = sl.reduce((a, b) => a + b, 0) / sl.length; out.push(['🌙', `Sleep avg ${avg.toFixed(1)}h over the last week${avg < 7 ? ' — below 7h' : ''}.`, avg < 7 ? 'warn' : 'good']); }
  // birthday
  const bd = nextBirthday(); if (bd && bd.days <= 30) out.push(['🎂', bd.days === 0 ? 'Happy birthday! 🎉' : `Birthday in ${bd.days} days — turning ${bd.age}.`, 'good']);
  const rank = { bad: 0, warn: 1, good: 2, info: 3 };
  return out.sort((a, b) => rank[a[2]] - rank[b[2]]).slice(0, 6);
}

/* ---------------- age ---------------- */
function dob() { return pdate(DATA.profile.dob); }
function ageParts(now = new Date()) {
  const b = dob(); if (!b) return null;
  let y = now.getFullYear() - b.getFullYear(), m = now.getMonth() - b.getMonth(), d = now.getDate() - b.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d, days: Math.floor((now - b) / 864e5), exact: (now - b) / (365.2425 * 864e5) };
}
function nextBirthday() {
  const b = dob(); if (!b) return null; const now = new Date();
  let n = new Date(now.getFullYear(), b.getMonth(), b.getDate()); if (dkey(n) < dkey(now)) n = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
  return { days: daysBetween(now, n), age: n.getFullYear() - b.getFullYear() };
}

/* ---------------- charts (hand-rolled SVG) ---------------- */
function ring(pct, { size = 110, sw = 10, color = 'url(#gradA)', label = '', sub = '', track = 'rgba(255,255,255,.08)' } = {}) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(pct, 0, 100) / 100);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}">
    <defs><linearGradient id="gradA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TH.a1}"/><stop offset="1" stop-color="${THEME === 'forest' ? TH.a1 : TH.a2}"/></linearGradient></defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${track}" stroke-width="${sw}" fill="none"/>
    <circle class="rc" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${off}"/></svg>
    <div class="lbl"><b>${label}</b><span>${sub}</span></div></div>`;
}
function lineChart(entries, { w = 640, h = 220, color = TH.a1, target = null, unit = '', id = 'lc' } = {}) {
  const e = [...entries].filter(x => pdate(x.date)).sort((a, b) => a.date.localeCompare(b.date));
  if (!e.length) return '<div class="empty">No entries yet</div>';
  const P = { l: 40, r: 14, t: 16, b: 26 };
  const xs = e.map(x => pdate(x.date).getTime()), ys = e.map(x => +x.value);
  let y0 = Math.min(...ys, target ?? Infinity), y1 = Math.max(...ys, target ?? -Infinity);
  const padY = (y1 - y0) * 0.15 || Math.abs(y1) * 0.05 || 1; y0 -= padY; y1 += padY;
  const x0 = Math.min(...xs), x1 = Math.max(...xs), X = v => P.l + (x1 === x0 ? (w - P.l - P.r) / 2 : (v - x0) / (x1 - x0) * (w - P.l - P.r)), Y = v => P.t + (1 - (v - y0) / (y1 - y0)) * (h - P.t - P.b);
  const pts = e.map((x, i) => [X(xs[i]), Y(ys[i])]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [a, b] = pts[i - 1], [c, dd] = pts[i], mx = (a + c) / 2; d += ` C${mx},${b} ${mx},${dd} ${c},${dd}`; }
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * 1.15;
  const area = `${d} L${pts[pts.length - 1][0]},${h - P.b} L${pts[0][0]},${h - P.b} Z`;
  const grid = [0, .5, 1].map(f => { const v = y0 + (y1 - y0) * f; return `<line x1="${P.l}" x2="${w - P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.06)"/><text x="${P.l - 8}" y="${Y(v) + 4}" text-anchor="end">${fmt(v, Math.abs(v) < 10 ? 1 : 0)}</text>`; }).join('');
  const tl = target != null ? `<line x1="${P.l}" x2="${w - P.r}" y1="${Y(target)}" y2="${Y(target)}" stroke="${TH.ok}" stroke-dasharray="5 5" opacity=".7"/><text x="${w - P.r}" y="${Y(target) - 6}" text-anchor="end" style="fill:${TH.ok}">target ${target}${unit}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}${tl}<path class="ar" d="${area}" fill="url(#${id}g)"/><path class="ln" d="${d}" stroke="${color}" style="--len:${Math.ceil(len) + 10}"/>
    ${pts.map((p, i) => `<circle class="dt" cx="${p[0]}" cy="${p[1]}" r="${pts.length > 30 ? 2 : 4}" fill="${THEME === 'forest' ? '#fff' : TH.bg}" stroke="${color}" stroke-width="2"><title>${fmtDate(e[i].date, true)}: ${e[i].value}${unit}</title></circle>`).join('')}
    <text x="${P.l}" y="${h - 6}">${fmtDate(e[0].date)}</text><text x="${w - P.r}" y="${h - 6}" text-anchor="end">${fmtDate(e[e.length - 1].date)}</text></svg>`;
}
function spark(entries, color = TH.a1, w = 120, h = 36) {
  const e = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-20); if (e.length < 2) return '';
  const ys = e.map(x => +x.value), y0 = Math.min(...ys), y1 = Math.max(...ys) || 1;
  const pts = ys.map((v, i) => [i / (ys.length - 1) * w, h - 3 - (y1 === y0 ? .5 : (v - y0) / (y1 - y0)) * (h - 6)]);
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="width:${w}px"><path class="ln" d="M${pts.map(p => p.join(',')).join(' L')}" stroke="${color}" style="--len:${Math.ceil(len) + 5}"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="3" fill="${color}"/></svg>`;
}
function radar(attr, size = 260) {
  const keys = Object.keys(ATTRS), c = size / 2, R = size / 2 - 38, lv = keys.map(k => attrLevel(attr[k] || 0)), mx = Math.max(5, ...lv);
  const pt = (i, f) => { const a = -Math.PI / 2 + i * 2 * Math.PI / keys.length; return [c + Math.cos(a) * R * f, c + Math.sin(a) * R * f]; };
  const rings = [.25, .5, .75, 1].map(f => `<polygon points="${keys.map((_, i) => pt(i, f).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,${f === 1 ? .15 : .07})"/>`).join('');
  const spokes = keys.map((_, i) => `<line x1="${c}" y1="${c}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" stroke="rgba(255,255,255,.07)"/>`).join('');
  const poly = keys.map((k, i) => pt(i, Math.max(.06, lv[i] / mx)).join(',')).join(' ');
  const labels = keys.map((k, i) => { const [x, y] = pt(i, 1.2); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" style="fill:${ATTRS[k].color};font-weight:700;font-size:11px">${k} ${lv[i]}</text>`; }).join('');
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" style="max-width:${size}px;margin:0 auto"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TH.a1}" stop-opacity=".55"/><stop offset="1" stop-color="${TH.a2}" stop-opacity=".3"/></linearGradient></defs>
    ${rings}${spokes}<polygon points="${poly}" fill="url(#rg)" stroke="${THEME === 'forest' ? TH.a1 : TH.a2}" stroke-width="2" style="transform-origin:${c}px ${c}px;animation:pop 1s cubic-bezier(.2,1.4,.4,1)"/>
    ${keys.map((k, i) => { const [x, y] = pt(i, Math.max(.06, lv[i] / mx)); return `<circle cx="${x}" cy="${y}" r="4" fill="${ATTRS[k].color}"/>`; }).join('')}${labels}</svg>`;
}
function heatmap(scoreFn, weeks = 20) {
  const now = new Date(), start = addDays(now, -((weeks - 1) * 7 + now.getDay())); let h = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i), k = dkey(d), v = scoreFn(k), fut = d > now && k !== todayKey();
    const l = fut ? '' : v <= 0 ? '' : v < .34 ? 'l1' : v < .67 ? 'l2' : v < 1 ? 'l3' : 'l4';
    h += `<i class="${l}${k === todayKey() ? ' today' : ''}${fut ? ' fut' : ''}" title="${fmtDate(k, true)}${fut ? '' : ` · ${Math.round(v * 100)}%`}"></i>`;
  }
  return `<div class="heat">${h}</div>`;
}
function bars(vals, labels, todayIdx = -1) {
  const mx = Math.max(1, ...vals);
  return `<div class="bars">${vals.map((v, i) => `<div class="b${i === todayIdx ? ' today' : ''}" title="${labels[i]}: ${fmt(v)}"><i style="height:${Math.max(3, v / mx * 100)}%;animation-delay:${i * 30}ms"></i><span>${labels[i]}</span></div>`).join('')}</div>`;
}
const attrChip = a => `<span class="chip attr" style="background:${ATTRS[a]?.color}22;color:${ATTRS[a]?.color}">${ATTRS[a]?.icon} ${a}</span>`;

/* ---------------- views ---------------- */
function todayPlan() { const d = new Date().getDay(); return DATA.gym.split.find(s => +s.dow === d); }
function hdr(title, sub, actions = '') { return `<div class="topbar"><div><h1>${title}</h1><div class="sub">${sub}</div></div><div class="row">${actions}</div></div>`; }
function greet() { const h = new Date().getHours(); return h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'; }

const V = {};
V.home = () => {
  const D = DATA, P = D.profile, T = todayKey(), tq = D.log[T]?.q || {};
  const TQ = questsOn(T), done = TQ.filter(q => tq[q.id]).length, pct = TQ.length ? done / TQ.length * 100 : 0;
  const ap = ageParts(), bd = nextBirthday(), lifePct = ap ? ap.exact / (P.lifeYears || 80) * 100 : 0;
  const sizeAv = 118, rr = (sizeAv - 8) / 2, cc = 2 * Math.PI * rr, off = cc * (1 - S.cur / S.need);
  const nowHM = `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;
  const rt = [...D.routine].sort((a, b) => a.time.localeCompare(b.time));
  let nowIdx = -1; rt.forEach((r, i) => { if (r.time <= nowHM) nowIdx = i; });
  const open = D.tasks.filter(t => !t.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9') || ('hml'.indexOf(a.prio?.[0]) - 'hml'.indexOf(b.prio?.[0]))).slice(0, 4);
  const last14 = Array.from({ length: 14 }, (_, i) => dkey(addDays(new Date(), i - 13)));
  const w = D.health.metrics.find(m => m.key === 'weight'), wl = w && [...w.entries].sort((a, b) => a.date.localeCompare(b.date)).pop();
  const bmi = wl && P.heightCm ? wl.value / (P.heightCm / 100) ** 2 : null, plan = todayPlan();
  return `
  ${D.meta.demo ? `<div class="banner">🧪 <span>You're viewing <b>sample data</b>. Send Claude your real details, then import the file in <a href="#/vault">Vault</a>. Or edit things directly here.</span></div>` : ''}
  ${hdr(`${greet()}, ${esc(P.name.split(' ')[0])}`, new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
  <div class="grid g-home">
    <section class="card glass hero s8">
      <div class="avatar">
        <svg width="${sizeAv}" height="${sizeAv}"><defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TH.a1}"/><stop offset=".5" stop-color="${TH.a2}"/><stop offset="1" stop-color="${TH.a3}"/></linearGradient></defs>
        <circle cx="${sizeAv / 2}" cy="${sizeAv / 2}" r="${rr}" stroke="rgba(255,255,255,.08)" stroke-width="5" fill="none"/>
        <circle class="rc" cx="${sizeAv / 2}" cy="${sizeAv / 2}" r="${rr}" stroke="url(#av)" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="${cc}" stroke-dashoffset="${cc}" data-off="${off}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)"/></svg>
        <div class="face">${P.photo ? `<img src="${esc(P.photo)}" alt="">` : esc(P.avatar || '🙂')}</div>
        <div class="lvl">LVL ${S.level}</div>
      </div>
      <div class="who">
        <div class="rank">${S.rank} · ${fmt(S.xp)} XP</div>
        <div class="name">${esc(P.name)}</div>
        <div class="tag">${esc(P.tagline || '')}</div>
        <div class="between small muted" style="margin-bottom:6px"><span>Level ${S.level} → ${S.level + 1}</span><span class="mono">${fmt(S.cur)} / ${fmt(S.need)} XP</span></div>
        <div class="xpbar"><i style="width:0" data-w="${S.cur / S.need * 100}%"></i></div>
        <div class="meta">
          <button class="pill statusbtn" data-act="editStatus">${esc(P.status?.emoji || '💭')} ${esc(P.status?.text || 'Set status')}</button>
          <span class="pill">🔥 ${S.streak}-day streak</span>
          <span class="pill">📍 ${esc(P.location || '')}</span>
          <button class="pill statusbtn" data-act="editProfile">${icon('edit', 14)} Profile</button>
        </div>
      </div>
    </section>

    <section class="card glass s4">
      <h3>${icon('clock', 16)} Age · live <span class="sp"></span><button class="btn sm icon" data-act="editProfile" aria-label="Edit">${icon('edit', 14)}</button></h3>
      ${ap ? `<div class="age-num" data-age>${ap.exact.toFixed(9)}</div><div class="muted small">years old</div>
      <div class="kv"><div><b>${ap.y}y ${ap.m}m ${ap.d}d</b><span>exact</span></div><div><b class="mono">${fmt(ap.days)}</b><span>days lived</span></div><div><b>${bd.days}d</b><span>to ${bd.age}</span></div></div>
      <div class="between small muted" style="margin:14px 0 6px"><span>Life progress (${P.lifeYears || 80}y)</span><span>${lifePct.toFixed(1)}%</span></div>
      <div class="bar"><i style="width:0" data-w="${lifePct}%"></i></div>` : '<div class="empty">Add your date of birth in Profile</div>'}
    </section>

    <section class="card glass s5">
      <h3>${icon('bolt', 16)} Daily quests <span class="sp"></span><span class="chip">${done}/${TQ.length}</span></h3>
      <div class="row" style="gap:16px;margin-bottom:14px;flex-wrap:nowrap">
        ${ring(pct, { size: 88, sw: 9, label: `${Math.round(pct)}%`, sub: 'today' })}
        <div class="small muted">Finish ≥50% to keep your streak. Clear them all for a <b style="color:var(--a2)">+50 XP</b> perfect-day bonus.</div>
      </div>
      ${TQ.map(q => `<div class="quest${tq[q.id] ? ' done' : ''}" data-act="quest" data-id="${q.id}" style="--c:${ATTRS[q.attr]?.color}">
        <div class="ck">${icon('check', 14)}</div><span class="ic">${esc(q.icon)}</span><span class="qt">${esc(q.title)}</span>
        ${S.qStreak[q.id] >= 2 ? `<span class="streak">🔥${S.qStreak[q.id]}</span>` : ''}<span class="xp">+${q.xp}</span></div>`).join('')}
      <button class="btn sm" data-act="addQuest" style="margin-top:6px">${icon('plus', 14)} Quest</button>
    </section>

    <section class="card glass s4">
      <h3>${icon('spark', 16)} Insights</h3>
      ${insights().map(([ic, t, tone]) => `<div class="ins ${tone}"><div class="ii">${ic}</div><p>${esc(t)}</p></div>`).join('')}
    </section>

    <section class="card glass s3">
      <h3>${icon('radar', 16)} Attributes</h3>
      ${radar(S.attr, 240)}
      <a href="#/trophies" class="small" style="display:block;text-align:center;margin-top:6px">View all stats →</a>
    </section>

    <section class="card glass s8">
      <h3>${icon('bolt', 16)} Recent activity</h3>
      ${activityFeed(5).map(a => `<div class="act"><span class="d"></span><span>${esc(a.icon)} ${esc(a.text)}</span><span class="tm">${ago(a.t)}</span></div>`).join('') || '<div class="empty">Your activity will show up here</div>'}
    </section>

    <section class="card glass s4">
      <h3>${icon('spark', 16)} Quick actions</h3>
      <div class="qa">
        <button class="btn primary" data-act="quickTask">${icon('plus', 16)} New task</button>
        <button class="btn" data-act="logWorkout">${icon('dumbbell', 16)} Log workout</button>
        <a class="btn" href="#/health">${icon('heart', 16)} Daily check-in</a>
        <button class="btn" data-act="sync">${icon('cloud', 16)} Sync vault</button>
      </div>
    </section>

    <section class="card glass s4">
      <h3>${icon('clock', 16)} Today's flow</h3>
      <div class="sched">${rt.map((r, i) => `<div class="it ${i < nowIdx ? 'past' : i === nowIdx ? 'now' : ''}"><span class="t">${r.time}</span><span>${esc(r.icon || '')} ${esc(r.label)}</span></div>`).join('')}</div>
    </section>

    <section class="card glass s4">
      <h3>${icon('tasks', 16)} Focus <span class="sp"></span><a href="#/tasks" class="small">All →</a></h3>
      ${open.length ? open.map(taskRow).join('') : '<div class="empty">Nothing open 🎉</div>'}
    </section>

    <section class="card glass s4">
      <h3>${icon('target', 16)} Goals <span class="sp"></span><a href="#/goals" class="small">All →</a></h3>
      ${D.goals.slice(0, 4).map(g => { const p = goalPct(g); return `<div class="gl"><div class="between"><span>${esc(g.title)}</span><b class="mono">${p}%</b></div><div class="bar" style="--c1:${ATTRS[g.attr]?.color}"><i style="width:0" data-w="${p}%"></i></div></div>`; }).join('') || '<div class="empty">No goals yet</div>'}
    </section>

    <section class="card glass s7">
      <h3>${icon('flame', 16)} Consistency · 20 weeks <span class="sp"></span><span class="chip">best ${S.best}d</span></h3>
      ${heatmap(k => S.dayScore[k] || 0)}
      <div class="row small muted" style="margin-top:10px;gap:14px"><span>🔥 Current ${S.streak}d</span><span>💎 ${S.perfectDays} perfect days</span><span>✅ ${fmt(S.questDone)} quests</span></div>
    </section>

    <section class="card glass s5">
      <h3>${icon('bolt', 16)} XP · last 14 days</h3>
      ${bars(last14.map(k => S.xpDay[k] || 0), last14.map(k => pdate(k).getDate()), 13)}
    </section>

    <section class="card glass s4">
      <h3>${icon('heart', 16)} Health snapshot <span class="sp"></span><a href="#/health" class="small">Open →</a></h3>
      <div class="row" style="gap:22px;align-items:flex-end">
        <div><div class="big sm">${wl ? wl.value : '—'}<small class="muted" style="font-size:14px"> kg</small></div><div class="small muted">weight</div></div>
        <div><div class="big sm">${bmi ? bmi.toFixed(1) : '—'}</div><div class="small muted">BMI</div></div>
        <div><div class="big sm">${healthScore()}</div><div class="small muted">health score</div></div>
        <div class="grow" style="min-width:120px">${w ? spark(w.entries, TH.ok, 200, 44) : ''}</div>
      </div>
    </section>

    ${fuelCard()}
    <section class="card glass s4">
      <h3>${icon('dumbbell', 16)} Today's training <span class="sp"></span><a href="#/gym" class="small">Gym →</a></h3>
      ${plan && plan.exercises.length ? `<div class="between"><div><div class="big sm">${esc(plan.name)}</div><div class="small muted">${plan.exercises.length} exercises · ${plan.exercises.reduce((a, e) => a + +e.sets, 0)} sets</div></div>
        ${D.gym.logs.some(l => l.date === T) ? '<span class="chip" style="color:var(--ok)">✔ Logged</span>' : `<button class="btn primary sm" data-act="logWorkout">${icon('plus', 14)} Log it</button>`}</div>
        <div class="small muted" style="margin-top:10px">${plan.exercises.map(e => esc(e.name)).join(' · ')}</div>` : '<div class="big sm">Rest day 😌</div><div class="small muted">Recovery is part of the plan.</div>'}
    </section>
  </div>`;
};

function fuelCard() {
  const N = nutrition(), T = todayKey(), a = sumRecipes(eatenIds(T)), p = planFor(T), next = SLOTS.find(([s]) => p[s] && !(DATA.meals.eaten[T] || {})[s]);
  return `<section class="card glass s4"><h3>${icon('chef', 16)} Today's fuel <span class="sp"></span><a href="#/meals" class="small">Meals →</a></h3>
    <div class="row" style="gap:18px;flex-wrap:nowrap">${ring(a.p / N.protein * 100, { size: 92, sw: 9, color: TH.a1, label: a.p + 'g', sub: `of ${N.protein}g` })}
    <div class="grow"><div class="big sm">${fmt(a.kcal)}<small class="muted" style="font-size:13px"> / ${fmt(N.kcal)} kcal</small></div>
    <div class="small muted" style="margin-top:6px">${next ? `Next: ${next[2]} <b style="color:var(--text)">${esc(recipe(p[next[0]])?.name || '')}</b>` : 'All meals done today 🎉'}</div></div></div></section>`;
}
function taskRow(t) {
  const od = !t.done && t.due && t.due < todayKey();
  return `<div class="task${t.done ? ' done' : ''}"><span class="pr" style="background:${PRIO[t.prio] || PRIO.med}"></span>
    <div class="ck" data-act="task" data-id="${t.id}">${icon('check', 12)}</div>
    <div class="grow"><div class="tt">${esc(t.title)}</div><div class="row small" style="gap:6px;margin-top:3px">${attrChip(t.attr || 'DIS')}
    ${t.due ? `<span class="${od ? '' : 'muted'}" style="${od ? 'color:var(--bad);font-weight:600' : ''}">${t.done ? 'done ' + rel(t.doneAt) : 'due ' + rel(t.due)}</span>` : ''}<span class="dim">+${t.xp || 20} XP</span></div></div>
    <button class="btn icon sm del" data-act="delTask" data-id="${t.id}" aria-label="Delete">${icon('trash', 14)}</button></div>`;
}

const inRange = m => m.min == null || m.max == null || (m.value >= m.min && m.value <= m.max);
function latestMarkers() {
  const reps = DATA.health.reports.filter(r => r.date && r.markers?.length), date = reps.map(r => r.date).sort().pop();
  const all = reps.filter(r => r.date === date).flatMap(r => r.markers).filter(m => typeof m.value === 'number');
  const dev = m => (m.value < m.min ? m.min - m.value : m.value - m.max) / Math.max(1e-9, (m.max - m.min) || Math.abs(m.max) || 1);
  const flagged = all.filter(m => !inRange(m)).sort((a, b) => (b.key ? 1 : 0) - (a.key ? 1 : 0) || dev(b) - dev(a));
  return { date, all, flagged };
}
function markerRow(m) {
  const has = m.min != null && m.max != null && m.max > m.min, span = has ? m.max - m.min : 1, lo = has ? m.min - span * 0.333 : 0, hi = has ? m.max + span * 0.333 : 1;
  const pos = has ? clamp((m.value - lo) / (hi - lo) * 100, 2, 98) : 50, ok = inRange(m);
  return `<div class="marker"><div class="between small"><b>${esc(m.name)}</b><span class="mono" style="color:${ok ? 'var(--ok)' : 'var(--bad)'};font-weight:700">${m.value} <span class="muted" style="font-weight:400">${esc(m.unit || '')}</span></span></div>
    ${has ? `<div class="rng"><i style="left:${pos}%;--c:${ok ? 'var(--ok)' : 'var(--bad)'}"></i></div><div class="between dim" style="font-size:11px"><span>${esc(m.note || '')}</span><span>ref ${m.min}–${m.max}</span></div>` : m.note ? `<div class="dim" style="font-size:11px;margin-top:4px">${esc(m.note)}</div>` : ''}</div>`;
}
function healthScore() {
  const lm = latestMarkers();
  let pts = [], tot = 0;
  lm.all.forEach(m => { if (m.min == null || m.max == null) return; pts.push(m.value >= m.min && m.value <= m.max ? 1 : 0.4); });
  DATA.health.metrics.forEach(m => { const e = [...m.entries].sort((a, b) => a.date.localeCompare(b.date)).pop(); if (!e || m.target == null) return;
    const dev = Math.abs(e.value - m.target) / (m.target || 1); pts.push(m.better === 'lower' && e.value <= m.target ? 1 : clamp(1 - dev * 2, 0.3, 1)); });
  const sl = Object.entries(DATA.log).filter(([d, l]) => l.sleepH && daysBetween(pdate(d), new Date()) <= 7).map(([, l]) => l.sleepH);
  if (sl.length) pts.push(clamp(sl.reduce((a, b) => a + b) / sl.length / 7.5, 0.3, 1));
  if (!pts.length) return '—';
  tot = pts.reduce((a, b) => a + b, 0) / pts.length; return Math.round(tot * 100);
}

V.goals = () => {
  const G = DATA.goals;
  return `${hdr('Goals', `${G.filter(g => goalPct(g) >= 100).length} of ${G.length} complete`, `<button class="btn primary" data-act="addGoal">${icon('plus', 16)} New goal</button>`)}
  <div class="grid auto">${G.map(g => {
    const p = goalPct(g), due = pdate(g.due), dl = due ? daysBetween(new Date(), due) : null, col = ATTRS[g.attr]?.color || TH.a1;
    return `<section class="card glass goal"><div class="top">${ring(p, { size: 92, sw: 9, color: col, label: p + '%', sub: 'done' })}
      <div class="grow"><div class="row" style="gap:6px;margin-bottom:6px"><span class="chip">${esc(g.category || 'Goal')}</span>${attrChip(g.attr || 'DIS')}</div><h4>${esc(g.title)}</h4>
      <div class="small muted">${due ? `${fmtDate(g.due, true)} · ${dl >= 0 ? dl + ' days left' : Math.abs(dl) + ' days over'}` : 'No deadline'}</div></div></div>
      ${g.milestones?.length ? `<div style="margin-top:14px">${g.milestones.map((m, i) => `<div class="ms${m.done ? ' done' : ''}" data-act="ms" data-id="${g.id}" data-i="${i}"><div class="bx">${icon('check', 11)}</div><span>${esc(m.t)}</span></div>`).join('')}</div>`
        : `<div class="row" style="margin-top:14px"><button class="btn sm" data-act="gprog" data-id="${g.id}" data-d="-5">−5%</button><div class="grow bar" style="--c1:${col}"><i style="width:0" data-w="${p}%"></i></div><button class="btn sm" data-act="gprog" data-id="${g.id}" data-d="5">+5%</button></div>`}
      <div class="row end" style="margin-top:12px"><button class="btn sm" data-act="editGoal" data-id="${g.id}">${icon('edit', 14)} Edit</button><button class="btn sm danger" data-act="delGoal" data-id="${g.id}">${icon('trash', 14)}</button></div></section>`;
  }).join('') || '<div class="empty">No goals yet. Add your first one.</div>'}</div>`;
};

V.health = () => {
  const H = DATA.health, P = DATA.profile, T = todayKey(), L = DATA.log[T] || {};
  if (!ui.metric || !H.metrics.find(m => m.key === ui.metric)) ui.metric = H.metrics[0]?.key;
  const sel = H.metrics.find(m => m.key === ui.metric);
  const w = H.metrics.find(m => m.key === 'weight'), wl = w && [...w.entries].sort((a, b) => a.date.localeCompare(b.date)).pop();
  const bmi = wl && P.heightCm ? wl.value / (P.heightCm / 100) ** 2 : null;
  const bmiCat = !bmi ? '' : bmi < 18.5 ? 'Underweight' : bmi < 23 ? 'Healthy (Asian cut-off)' : bmi < 25 ? 'Overweight (Asian cut-off)' : 'High';
  const last14 = Array.from({ length: 14 }, (_, i) => dkey(addDays(new Date(), i - 13)));
  const hs = healthScore();
  return `${hdr('Health', 'Body metrics, lab reports and daily check-ins', `<button class="btn" data-act="addMetric">${icon('plus', 16)} Metric</button><button class="btn primary" data-act="addReport">${icon('plus', 16)} Report</button>`)}
  <div class="grid g-home">
    <section class="card glass s4"><h3>${icon('heart', 16)} Health score</h3><div class="row" style="gap:18px;flex-wrap:nowrap">${ring(hs === '—' ? 0 : hs, { size: 120, sw: 11, color: TH.ok, label: hs, sub: '/ 100' })}
      <div class="small muted">Combines lab markers in range, metrics vs targets, and your 7-day sleep average.${bmi ? `<div style="margin-top:10px"><b class="big sm" style="color:var(--text)">${bmi.toFixed(1)}</b> BMI<br>${bmiCat}</div>` : ''}</div></div></section>
    <section class="card glass s8"><h3>${icon('spark', 16)} Daily check-in · today</h3>
      <div class="field"><label class="fl">Mood</label><div class="emoji-pick">${['😫','😕','😐','🙂','😄','🤩'].map(e => `<button data-act="mood" data-v="${e}" class="${L.mood === e ? 'on' : ''}">${e}</button>`).join('')}</div></div>
      <div class="row"><div class="grow field"><label class="fl">Sleep (hours)</label><input class="in" type="number" step="0.1" min="0" max="16" id="ci-sleep" value="${L.sleepH ?? ''}"></div>
      <div class="grow field"><label class="fl">Water (litres)</label><input class="in" type="number" step="0.1" min="0" max="10" id="ci-water" value="${L.waterL ?? ''}"></div>
      <div class="grow field"><label class="fl">Steps</label><input class="in" type="number" step="100" min="0" id="ci-steps" value="${L.steps ?? ''}"></div></div>
      <div class="row"><input class="in grow" id="ci-note" placeholder="How do you feel? (note)" value="${esc(L.note || '')}"><button class="btn primary" data-act="checkin">${icon('check', 16)} Save</button></div></section>
    ${H.metrics.map((m, i) => { const e = [...m.entries].sort((a, b) => a.date.localeCompare(b.date)), last = e[e.length - 1], prev = e[e.length - 2];
      const dlt = last && prev ? last.value - prev.value : 0, good = m.better === 'lower' ? dlt < 0 : m.better === 'higher' ? dlt > 0 : m.target != null && last ? Math.abs(last.value - m.target) < Math.abs(prev?.value - m.target) : dlt > 0;
      const colors = TH.series;
      return `<section class="card glass metric s3${m.key === ui.metric ? ' sel' : ''}" data-act="pickMetric" data-k="${m.key}"><h3>${esc(m.label)}<span class="sp"></span><button class="btn sm icon" data-act="addEntry" data-k="${m.key}" aria-label="Add entry">${icon('plus', 14)}</button></h3>
        <div class="between"><div class="v">${last ? last.value : '—'}<small>${esc(m.unit)}</small></div>${spark(m.entries, colors[i % colors.length], 90, 34)}</div>
        <div class="row small" style="gap:8px;margin-top:4px">${prev ? `<span class="delta ${dlt === 0 ? 'flat' : good ? 'up' : 'down'}">${dlt > 0 ? '▲' : dlt < 0 ? '▼' : '■'} ${fmt(Math.abs(dlt), 1)}</span>` : ''}${m.target != null ? `<span class="muted">target ${m.target}${esc(m.unit)}</span>` : ''}</div></section>`; }).join('')}
    <section class="card glass s8"><h3>${icon('bolt', 16)} ${esc(sel?.label || 'Metric')} trend <span class="sp"></span>${sel ? `<button class="btn sm" data-act="editMetric" data-k="${sel.key}">${icon('edit', 14)} Edit</button>` : ''}</h3>
      ${sel ? lineChart(sel.entries, { target: sel.target, unit: sel.unit, color: TH.a1, id: 'hm' }) : '<div class="empty">Add a metric</div>'}</section>
    <section class="card glass s4"><h3>🌙 Sleep · 14 days</h3>${bars(last14.map(k => DATA.log[k]?.sleepH || 0), last14.map(k => pdate(k).getDate()), 13)}
      <div class="small muted" style="margin-top:8px">Log sleep in the daily check-in above.</div></section>
    ${(() => { const lm = latestMarkers(); if (!lm.all.length) return '';
      return `<section class="card glass s12"><h3>⚠️ Needs attention · ${fmtDate(lm.date, true)}<span class="sp"></span><span class="chip" style="color:var(--ok)">${lm.all.length - lm.flagged.length} in range</span><span class="chip" style="color:var(--bad)">${lm.flagged.length} out of range</span></h3>
        ${lm.flagged.length ? `<div class="grid auto" style="gap:0 24px">${lm.flagged.map(markerRow).join('')}</div>` : '<div class="empty">Everything in range 🎉</div>'}
        <p class="small dim" style="margin-top:10px">Reference ranges come from your lab. This is a tracker, not medical advice. Go over flagged results with a doctor.</p></section>`; })()}
    ${[...H.reports].sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title)).map(r => `<section class="card glass s6"><h3>🩺 ${esc(r.title)}<span class="sp"></span>${r.markers.length ? `<span class="chip">${r.markers.filter(inRange).length}/${r.markers.length} ✓</span>` : ''}<span class="chip">${fmtDate(r.date, true)}</span><button class="btn sm icon danger" data-act="delReport" data-id="${r.id}" aria-label="Delete">${icon('trash', 14)}</button></h3>
      ${r.notes ? `<p class="small muted" style="margin-bottom:6px">${esc(r.notes)}</p>` : ''}
      ${(r.findings || []).map(f => `<div class="ex"><span>${esc(f[0])}</span><span class="muted" style="text-align:right">${esc(f[1])}</span></div>`).join('')}
      ${r.markers.map(markerRow).join('')}</section>`).join('')}
  </div>`;
};

V.gym = () => {
  const G = DATA.gym, plan = todayPlan(), T = todayKey(), dow = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  const prs = Object.entries(S.prs).sort((a, b) => b[1].e - a[1].e), mx = prs[0]?.[1].e || 1;
  const weeks = Array.from({ length: 12 }, (_, i) => { const end = addDays(new Date(), -7 * (11 - i)); const st = addDays(end, -6);
    return G.logs.filter(l => l.date >= dkey(st) && l.date <= dkey(end)).reduce((a, l) => a + l.sets.reduce((b, s) => b + (s.w || 0) * (s.r || 0), 0), 0) / 1000; });
  const gset = new Set(G.logs.map(l => l.date));
  return `${hdr('Gym', `${S.workouts} workouts logged · STR level ${attrLevel(S.attr.STR)}`, `<button class="btn" data-act="editSplit">${icon('edit', 16)} Edit split</button><button class="btn primary" data-act="logWorkout">${icon('plus', 16)} Log workout</button>`)}
  <div class="grid g-home">
    <section class="card glass s12"><h3>${icon('dumbbell', 16)} Weekly split</h3><div class="split">${order.map(d => { const s = G.split.find(x => +x.dow === d); return `<div class="d${d === dow ? ' today' : ''}"><b>${DOW[d].toUpperCase()}</b><span>${esc(s?.name || '—')}</span></div>`; }).join('')}</div></section>
    <section class="card glass s5"><h3>Today · ${esc(plan?.name || 'Rest')} <span class="sp"></span>${G.logs.some(l => l.date === T) ? '<span class="chip" style="color:var(--ok)">✔ Logged</span>' : ''}</h3>
      ${plan?.exercises.length ? plan.exercises.map(e => `<div class="ex"><span>${esc(e.name)}</span><span class="muted mono">${e.sets} × ${esc(e.reps)}${e.weight ? ` @ ${e.weight}kg` : ''}</span></div>`).join('') : '<div class="empty">Rest day. Walk, stretch, sleep well.</div>'}</section>
    <section class="card glass s7"><h3>📈 Personal records <span class="sp"></span><span class="chip">est. 1RM</span></h3>
      ${prs.length ? prs.slice(0, 8).map(([n, p]) => `<div class="gl"><div class="between small"><span>${esc(n)}</span><span class="mono"><b>${fmt(p.e, 1)} kg</b> <span class="muted">(${p.w}×${p.r})</span></span></div><div class="bar" style="--c1:${TH.a1};--c2:${TH.a3}"><i style="width:0" data-w="${p.e / mx * 100}%"></i></div></div>`).join('') : '<div class="empty">Log workouts with weights to see PRs.</div>'}</section>
    <section class="card glass s7"><h3>🏋️ Training days · 20 weeks</h3>${heatmap(k => gset.has(k) ? 1 : 0)}</section>
    <section class="card glass s5"><h3>Volume (tonnes / week)</h3>${bars(weeks.map(v => +v.toFixed(1)), weeks.map((_, i) => i === 11 ? 'now' : `-${11 - i}`), 11)}</section>
    <section class="card glass s12"><h3>Recent sessions</h3>
      ${[...G.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(l => { const vol = l.sets.reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0);
        return `<div class="ex"><span><b>${esc(l.day)}</b> <span class="muted">· ${fmtDate(l.date, true)}</span></span><span class="muted mono">${l.sets.length} sets · ${fmt(vol)} kg <button class="btn sm icon danger" data-act="delLog" data-d="${l.date}" data-n="${esc(l.day)}" aria-label="Delete">${icon('trash', 12)}</button></span></div>`; }).join('') || '<div class="empty">No sessions yet</div>'}</section>
  </div>`;
};

V.tasks = () => {
  const f = ui.taskFilter, T = DATA.tasks;
  const list = T.filter(t => f === 'all' || (f === 'open' ? !t.done : t.done)).sort((a, b) => a.done - b.done || (a.due || '9').localeCompare(b.due || '9'));
  return `${hdr('Tasks', `${T.filter(t => !t.done).length} open · ${S.tasksDone} completed · each one earns XP`)}
  <div class="grid g-home">
    <section class="card glass s12"><form id="taskform" class="row">
      <input class="in grow" name="title" placeholder="What needs doing?" required style="min-width:200px">
      <select class="in" name="prio" style="width:auto"><option value="high">🔴 High</option><option value="med" selected>🟡 Med</option><option value="low">🔵 Low</option></select>
      <select class="in" name="attr" style="width:auto">${Object.keys(ATTRS).map(a => `<option value="${a}">${ATTRS[a].icon} ${a}</option>`).join('')}</select>
      <input class="in" type="date" name="due" value="${todayKey()}" style="width:auto">
      <button class="btn primary">${icon('plus', 16)} Add</button></form></section>
    <section class="card glass s12"><div class="between" style="margin-bottom:14px"><div class="tabs">${['open', 'done', 'all'].map(x => `<button data-act="tf" data-v="${x}" class="${f === x ? 'on' : ''}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div><span class="small muted">${list.length} shown</span></div>
      ${list.map(taskRow).join('') || '<div class="empty">Nothing here.</div>'}</section>
  </div>`;
};

V.journey = () => {
  const J = [...DATA.journey].sort((a, b) => (a.date || '0000').localeCompare(b.date || '0000')), T = todayKey();
  const ap = ageParts();
  return `${hdr('Journey', 'The story so far, and what comes next', `<button class="btn primary" data-act="addEvent">${icon('plus', 16)} Milestone</button>`)}
  <div class="grid g-home">
    <section class="card glass s7"><h3>${icon('map', 16)} Timeline</h3><div class="tl">${J.map(e => { const fut = e.date && e.date > T.slice(0, e.date.length);
      return `<div class="ev${fut ? ' future' : ''}"><div class="dot">${esc(e.icon || '•')}</div><div class="glass" style="padding:14px 16px;border-radius:16px">
        <div class="between"><span class="when">${e.date ? fmtDate(e.date, true) : 'Date TBD'}${fut ? ' · upcoming' : ''}</span><span class="row" style="gap:4px"><button class="btn sm icon" data-act="editEvent" data-id="${e.id}" aria-label="Edit">${icon('edit', 13)}</button><button class="btn sm icon danger" data-act="delEvent" data-id="${e.id}" aria-label="Delete">${icon('trash', 13)}</button></span></div>
        <h4>${esc(e.title)}</h4><div class="small muted">${esc(e.desc || '')}</div></div></div>`; }).join('') || '<div class="empty">Add your first milestone</div>'}</div></section>
    <section class="card glass s5"><h3>⏳ Life in weeks</h3>${ap ? `<canvas id="weeks"></canvas><div class="row small muted" style="margin-top:10px;gap:14px"><span><b style="color:var(--text)">${fmt(Math.floor(ap.days / 7))}</b> weeks lived</span><span><b style="color:var(--text)">${fmt(Math.max(0, (DATA.profile.lifeYears || 80) * 52 - Math.floor(ap.days / 7)))}</b> to go (of ${DATA.profile.lifeYears || 80}y)</span></div><p class="small dim" style="margin-top:8px">Each dot is one week. Make the bright ones count.</p>` : '<div class="empty">Add your date of birth in Profile</div>'}</section>
  </div>`;
};

V.trophies = () => {
  const got = S.ach.filter(a => a.got).length;
  return `${hdr('Trophies & stats', `${got} / ${S.ach.length} achievements unlocked`)}
  <div class="grid auto-s two" style="margin-bottom:18px">${Object.entries(ATTRS).map(([k, a]) => { const x = S.attr[k] || 0, L = attrLevel(x), lo = 30 * (L - 1) ** 2, hi = 30 * L ** 2;
    return `<section class="card glass attr-card"><div class="between"><span style="font-size:24px">${a.icon}</span><span class="chip attr" style="background:${a.color}22;color:${a.color}">${k}</span></div>
      <div class="v" style="margin-top:8px">Lv ${L}</div><div class="small muted" style="margin-bottom:8px">${a.name} · ${fmt(x)} XP</div><div class="bar" style="--c1:${a.color};--c2:${a.color}"><i style="width:0" data-w="${(x - lo) / (hi - lo) * 100}%"></i></div></section>`; }).join('')}</div>
  <div class="grid auto-s two">${S.ach.map(a => `<section class="card glass ach ${a.got ? 'got' : 'lock'}"><div class="em">${a.em}</div><h4>${esc(a.name)}</h4><p>${esc(a.desc)}</p>
    ${a.got ? '<span class="chip" style="color:var(--warn)">★ Unlocked</span>' : `<div class="bar"><i style="width:0" data-w="${a.cur / a.target * 100}%"></i></div><div class="small dim" style="margin-top:6px">${fmt(a.cur)} / ${fmt(a.target)}</div>`}</section>`).join('')}</div>`;
};

V.vault = () => {
  const g = GH || {};
  return `${hdr('Vault', 'Encryption, sync, import and export')}
  <div class="grid g-home">
    <section class="card glass s6"><h3>${icon('vault', 16)} Status</h3>
      <p class="small muted" style="margin-bottom:12px">Your data is encrypted in your browser with <b>AES-256-GCM</b>. The key comes from your passphrase (PBKDF2, ${fmt(ITER)} rounds). The repo only ever holds <code>data.enc.json</code>, which is unreadable without your passphrase.</p>
      <div class="kv" style="grid-template-columns:1fr 1fr"><div><b>${DATA.meta.dirty ? 'Unsynced' : 'Synced'}</b><span>state</span></div><div><b>${new Date(DATA.meta.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</b><span>last change</span></div></div>
      <div class="row" style="margin-top:16px"><button class="btn primary" data-act="sync">${icon('cloud', 16)} ${GH?.token ? 'Push to GitHub' : 'Download data.enc.json'}</button><button class="btn" data-act="changePass">Change passphrase</button><button class="btn" data-act="forget">Forget this device</button></div></section>
    <section class="card glass s6"><h3>${icon('cloud', 16)} GitHub sync (optional)</h3>
      <p class="small muted" style="margin-bottom:12px">Save straight from any device. Use a <b>fine-grained token</b> scoped to this one repo with <i>Contents: read & write</i>. The token is stored encrypted on this device only.</p>
      <form id="ghform"><div class="row"><div class="grow field"><label class="fl">Owner</label><input class="in" name="owner" value="${esc(g.owner || '')}" placeholder="your-username"></div><div class="grow field"><label class="fl">Repo</label><input class="in" name="repo" value="${esc(g.repo || '')}" placeholder="lifeos"></div></div>
      <div class="row"><div class="grow field"><label class="fl">Branch</label><input class="in" name="branch" value="${esc(g.branch || 'main')}"></div><div class="grow field"><label class="fl">Token</label><input class="in" name="token" type="password" value="${esc(g.token || '')}" placeholder="github_pat_…"></div></div>
      <div class="row"><button class="btn primary">Save settings</button><button type="button" class="btn" data-act="ghPull">Pull latest</button></div></form></section>
    <section class="card glass s12"><h3>🎨 Appearance</h3>
      <div class="themes">
        <button data-act="theme" data-v="forest" class="${THEME === 'forest' ? 'on' : ''}"><div class="sw forest"></div><b>Firefly Forest</b><div class="small muted">Misty forest, fireflies, lime glass</div></button>
        <button data-act="theme" data-v="livery" class="${THEME === 'livery' ? 'on' : ''}"><div class="sw livery"></div><b>Neon Livery</b><div class="small muted">Black, neon red and neon yellow</div></button>
      </div></section>
    <section class="card glass s6"><h3>⬇️ Import / export</h3>
      <p class="small muted" style="margin-bottom:12px">Import a plain <code>data.json</code> (for example, one Claude builds from your details). It replaces everything and is encrypted immediately.</p>
      <div class="row"><label class="btn primary">${icon('up', 16)} Import JSON<input type="file" accept=".json,application/json" id="importf" hidden></label><button class="btn" data-act="exportPlain">${icon('down', 16)} Export plain JSON</button><button class="btn danger" data-act="loadDemo">Load sample data</button></div></section>
    <section class="card glass s6"><h3>{ } Raw editor</h3><p class="small muted" style="margin-bottom:10px">Power mode: edit anything, including quests, routine and split.</p>
      <textarea class="in" id="rawjson" style="min-height:220px">${esc(JSON.stringify(DATA, null, 2))}</textarea><div class="row end" style="margin-top:10px"><button class="btn primary" data-act="applyRaw">Apply</button></div></section>
  </div>`;
};

/* ---------------- render / router ---------------- */
function navHTML(mobile) { return VIEWS.map(([k, n, ic]) => `<a href="#/${k}" class="${VIEW === k ? 'on' : ''}">${icon(ic, mobile ? 21 : 19)}<span>${n}</span></a>`).join(''); }
function render(enter = false) {
  S = compute();
  const m = $('#main'), y = window.scrollY;
  m.innerHTML = headerHTML() + (V[VIEW] || V.home)() + statusHTML();
  $('#sring').innerHTML = sideRing();
  m.classList.toggle('enter', enter);
  $('#snav').innerHTML = navHTML(false); $('#bnav').innerHTML = navHTML(true);
  syncBadge();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('[data-w]', m).forEach(el => el.style.width = el.dataset.w);
    $$('.rc[data-off]').forEach(el => el.style.strokeDashoffset = el.dataset.off);
  }));
  if (!enter) window.scrollTo(0, y); else window.scrollTo(0, 0);
  wireSearch();
  if (VIEW === 'journey') drawWeeks();
  if (VIEW === 'tasks') $('#taskform').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); DATA.tasks.push({ id: uid(), title: f.get('title').trim(), prio: f.get('prio'), attr: f.get('attr'), due: f.get('due'), xp: { high: 30, med: 20, low: 15 }[f.get('prio')], done: false }); logAct('📝', `Added task “${f.get('title').trim()}”`); commit(); toast('Task added'); };
  if (VIEW === 'vault') { $('#ghform').onsubmit = saveGH; $('#importf').onchange = importFile; }
  afterChange();
}
function route() { const v = (location.hash.match(/^#\/(\w+)/) || [])[1]; VIEW = VIEWS.some(x => x[0] === v) ? v : 'home'; render(true); }
function tick() {
  const el = $('[data-age]'); if (el) { const a = ageParts(); if (a) el.textContent = a.exact.toFixed(9); }
  tickRAF = requestAnimationFrame(tick);
}

/* level-ups & achievement unlocks */
function afterChange() {
  const M = DATA.meta;
  if (!M.lastLevel) M.lastLevel = S.level;
  if (!M.seenAch) M.seenAch = S.ach.filter(a => a.got).map(a => a.id);
  const newA = S.ach.filter(a => a.got && !M.seenAch.includes(a.id));
  if (S.level > M.lastLevel) { M.lastLevel = S.level; levelUp(); scheduleSave(); }
  else if (S.level < M.lastLevel) { M.lastLevel = S.level; scheduleSave(); }
  if (newA.length) { newA.slice(0, 3).forEach((a, i) => setTimeout(() => toast(`${a.em} Achievement unlocked: <b>${esc(a.name)}</b>`), 400 + i * 700)); M.seenAch.push(...newA.map(a => a.id)); confetti(80); scheduleSave(); }
}
function levelUp() {
  confetti(220);
  modal(`<div class="lvlup"><div class="small muted" style="letter-spacing:.2em">LEVEL UP</div><div class="n">${S.level}</div><h2 style="margin:8px 0 4px">${S.rank}</h2><p class="muted">Next level at ${fmt(levelCum(S.level + 1))} XP. Keep going.</p><button class="btn primary" style="margin-top:18px" data-act="closeModal">Let's go</button></div>`);
}

/* ---------------- persistence ---------------- */
function commit(silent) { DATA.meta.updatedAt = Date.now(); DATA.meta.dirty = true; if (!silent) render(); scheduleSave(); }
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveLocal, 350); syncBadge(); }
async function saveLocal() { if (!KEY) return; ls.set(LS_VAULT, await encryptWith(KEY, SALT, DATA)); syncBadge(); }
function syncBadge() {
  const d = DATA?.meta?.dirty;
  $$('.sync').forEach(el => { el.classList.toggle('dirty', !!d); const l = $('.lbl', el); if (l) l.textContent = d ? (GH?.token ? 'Tap to sync' : 'Export needed') : 'Synced'; });
}
async function sync() {
  await saveLocal();
  const blob = await encryptWith(KEY, SALT, { ...DATA, meta: { ...DATA.meta, dirty: false } });
  if (GH?.token && GH.owner && GH.repo) {
    try {
      toast('Pushing to GitHub…');
      const url = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/data.enc.json`, h = { Authorization: `Bearer ${GH.token}`, Accept: 'application/vnd.github+json' };
      const cur = await fetch(`${url}?ref=${encodeURIComponent(GH.branch || 'main')}`, { headers: h, cache: 'no-store' });
      const sha = cur.ok ? (await cur.json()).sha : undefined;
      const r = await fetch(url, { method: 'PUT', headers: h, body: JSON.stringify({ message: `LifeOS vault update ${new Date().toISOString()}`, content: btoa(JSON.stringify(blob)), branch: GH.branch || 'main', sha }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || r.status);
      DATA.meta.dirty = false; await saveLocal(); render(); toast('✅ Synced to GitHub. Live in about a minute.');
    } catch (e) { toast('⚠️ GitHub push failed: ' + esc(e.message)); }
  } else {
    download('data.enc.json', JSON.stringify(blob));
    DATA.meta.dirty = false; await saveLocal(); render();
    toast('Downloaded data.enc.json. Upload it to your repo.');
  }
}
async function ghPull() {
  if (!GH?.token) return toast('Add GitHub settings first');
  try {
    const r = await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/data.enc.json?ref=${encodeURIComponent(GH.branch || 'main')}`, { headers: { Authorization: `Bearer ${GH.token}`, Accept: 'application/vnd.github.raw' }, cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const blob = await r.json(); const key = blob.salt === b64(SALT) ? KEY : await deriveKey(prompt('Passphrase for the remote vault') || '', unb64(blob.salt), blob.iter);
    const d = await decryptWith(key, blob);
    if (d.meta.updatedAt < DATA.meta.updatedAt && !confirm('The remote copy is older than this device. Replace local data anyway?')) return;
    DATA = d; DATA.meta.dirty = false; await saveLocal(); render(); toast('Pulled latest from GitHub');
  } catch (e) { toast('⚠️ Pull failed: ' + esc(e.message)); }
}
async function saveGH(e) {
  e.preventDefault(); const f = new FormData(e.target);
  GH = { owner: f.get('owner').trim(), repo: f.get('repo').trim(), branch: f.get('branch').trim() || 'main', token: f.get('token').trim() };
  ls.set(LS_GH, await encryptWith(KEY, SALT, GH)); toast('GitHub settings saved (encrypted)'); render();
}
function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
function normalize(d) {
  const demo = makeDemo();
  d.meta = { ...{ demo: false, created: Date.now(), updatedAt: Date.now(), lastLevel: 0, seenAch: null }, ...(d.meta || {}) };
  d.profile = { name: 'You', avatar: '🙂', photo: '', dob: '', lifeYears: 80, heightCm: null, tagline: '', location: '', status: { emoji: '💭', text: '' }, tags: [], ...(d.profile || {}) };
  normalizeMeals(d); d.activity ||= []; d.goals ||= []; d.tasks ||= []; d.journey ||= []; d.log ||= {}; d.routine ||= []; d.quests ||= demo.quests;
  d.health = { metrics: [], reports: [], ...(d.health || {}) };
  d.health.metrics.forEach(m => { m.entries ||= []; }); d.health.reports.forEach(r => { r.id ||= uid(); r.markers ||= []; });
  d.gym = { split: [], logs: [], ...(d.gym || {}) };
  [d.goals, d.tasks, d.journey].forEach(a => a.forEach(x => { x.id ||= uid(); }));
  d.quests.forEach(q => { q.id ||= uid(); q.attr = ATTRS[q.attr] ? q.attr : 'DIS'; q.xp = +q.xp || 10; });
  return d;
}
function importFile(e) {
  const file = e.target.files[0]; if (!file) return;
  file.text().then(t => { const d = JSON.parse(t); if (validBlob(d)) return toast('That is an encrypted vault. Place it in the repo instead.');
    if (!confirm('Replace ALL current data with this file?')) return; DATA = normalize(d); DATA.meta.seenAch = null; DATA.meta.lastLevel = 0; commit(); toast('Imported and encrypted ✔'); })
    .catch(err => toast('⚠️ Invalid JSON: ' + esc(err.message)));
}

/* ---------------- gate: welcome / unlock ---------------- */
async function boot() {
  if (!window.crypto?.subtle) { gate(`<div class="box glass"><div class="logo-big"></div><h1>Secure context needed</h1><p>Open LifeOS over https (GitHub Pages) or http://localhost. Encryption doesn't work from a file:// path.</p></div>`); return; }
  const remote = await fetch('data.enc.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null);
  const local = ls.get(LS_VAULT);
  const cands = [remote, local].filter(validBlob);
  if (!cands.length) return welcome();
  const rk = await idb.get('key');
  if (rk) { const r = await tryOpen(cands, () => rk.key, b => b.salt === rk.salt); if (r) return start(r); }
  unlockScreen(cands);
}
async function tryOpen(cands, keyFor, filter = () => true) {
  const found = [];
  for (const b of cands.filter(filter)) { try { const key = await keyFor(b); found.push({ d: await decryptWith(key, b), key, salt: unb64(b.salt) }); } catch {} }
  if (!found.length) return null;
  found.sort((a, b) => (b.d.meta?.updatedAt || 0) - (a.d.meta?.updatedAt || 0));
  return found[0];
}
function gate(html) { $('#gate').innerHTML = html; $('#gate').classList.remove('hidden'); $('#app').classList.add('hidden'); }
function unlockScreen(cands) {
  gate(`<form class="box glass" id="uf"><div class="logo-big"></div><h1>LifeOS</h1><p>Your vault is encrypted. Enter your passphrase.</p>
    <input class="in" type="password" id="pp" placeholder="Passphrase" autocomplete="current-password" autofocus>
    <label class="checkrow"><input type="checkbox" id="rem" checked> Remember this device</label>
    <button class="btn primary" id="ub">Unlock</button><p class="small dim" id="um" style="margin:14px 0 0"></p></form>`);
  $('#uf').onsubmit = async e => {
    e.preventDefault(); const pass = $('#pp').value; if (!pass) return; $('#ub').textContent = 'Decrypting…';
    const r = await tryOpen(cands, b => deriveKey(pass, unb64(b.salt), b.iter || ITER));
    if (!r) { $('#ub').textContent = 'Unlock'; $('#uf').classList.remove('shake'); void $('#uf').offsetWidth; $('#uf').classList.add('shake'); $('#um').textContent = 'Wrong passphrase.'; return; }
    if ($('#rem').checked) await idb.set('key', { key: r.key, salt: b64(r.salt) });
    start(r);
  };
}
function welcome() {
  gate(`<div class="box glass" id="wb"><div class="logo-big"></div><h1>Welcome to LifeOS</h1><p>Your life, as a game. Pick a starting point, then set a passphrase to encrypt everything.</p>
    <div style="display:grid;gap:10px"><button class="btn primary" data-act="wDemo">✨ Start with sample data</button>
    <label class="btn">${icon('up', 16)} Import my data.json<input type="file" id="wimp" accept=".json" hidden></label>
    <button class="btn" data-act="wBlank">Start blank</button></div></div>`);
  $('#wimp').onchange = e => e.target.files[0].text().then(t => setPass(normalize(JSON.parse(t)))).catch(err => toast('⚠️ ' + esc(err.message)));
}
function setPass(d) {
  gate(`<form class="box glass" id="pf"><div class="logo-big"></div><h1>Set a passphrase</h1><p>It encrypts all your data. There's no recovery, so use something long you'll remember.</p>
    <input class="in" type="password" id="p1" placeholder="Passphrase (8+ characters)" autocomplete="new-password" minlength="8" required>
    <input class="in" type="password" id="p2" placeholder="Repeat passphrase" autocomplete="new-password" required>
    <label class="checkrow"><input type="checkbox" id="rem" checked> Remember this device</label>
    <button class="btn primary">Create vault</button><p class="small dim" id="pm" style="margin:14px 0 0"></p></form>`);
  $('#pf').onsubmit = async e => {
    e.preventDefault(); const a = $('#p1').value, b = $('#p2').value;
    if (a.length < 8) return ($('#pm').textContent = 'Use at least 8 characters.'); if (a !== b) return ($('#pm').textContent = "Passphrases don't match.");
    const salt = crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(a, salt);
    if ($('#rem').checked) await idb.set('key', { key, salt: b64(salt) });
    d.meta.dirty = true; start({ d, key, salt }); await saveLocal();
    setTimeout(() => toast('Vault created. Use Sync to publish it to GitHub.'), 600);
  };
}
async function start({ d, key, salt }) {
  DATA = normalize(d); KEY = key; SALT = salt;
  const lb = ls.get(LS_GH); if (validBlob(lb) && lb.salt === b64(SALT)) { try { GH = await decryptWith(KEY, lb); } catch { GH = null; } }
  // if local cache is newer than what we opened, flag it as unsynced
  $('#gate').classList.add('hidden'); $('#app').classList.remove('hidden');
  route(); cancelAnimationFrame(tickRAF); tick();
}

/* ---------------- modal + forms ---------------- */
function modal(html) { $('#mbox').innerHTML = html; $('#modal').classList.add('open'); }
function closeModal() { $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
function form(title, fields, onSave, extra = '') {
  modal(`<h2>${title}</h2><form id="mf">${fields.map(f => `<div class="field"><label class="fl">${f.label}</label>${
    f.type === 'select' ? `<select class="in" name="${f.k}">${f.options.map(([v, l]) => `<option value="${esc(v)}"${String(f.value) === String(v) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`
    : f.type === 'textarea' ? `<textarea class="in" name="${f.k}" placeholder="${esc(f.ph || '')}">${esc(f.value ?? '')}</textarea>`
    : `<input class="in" name="${f.k}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" placeholder="${esc(f.ph || '')}"${f.step ? ` step="${f.step}"` : ''}${f.req ? ' required' : ''}>`}</div>`).join('')}
    ${extra}<div class="row end"><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn primary">Save</button></div></form>`);
  $('#mf').onsubmit = e => { e.preventDefault(); const fd = new FormData(e.target), v = {}; fields.forEach(f => { const x = fd.get(f.k); v[f.k] = f.type === 'number' ? (x === '' ? null : +x) : x; }); if (onSave(v) !== false) closeModal(); };
  setTimeout(() => $('#mf .in')?.focus(), 80);
}
const attrOpts = Object.keys(ATTRS).map(a => [a, `${ATTRS[a].icon} ${ATTRS[a].name}`]);

/* ---------------- actions ---------------- */
const A = {
  closeModal,
  theme: ({ v }) => { applyTheme(v); render(); toast(v === 'forest' ? '🌲 Firefly Forest' : '🏁 Neon Livery'); },
  bell: () => modal(`<h2>Insights</h2>${insights().map(([ic, t, tone]) => `<div class="ins ${tone}"><div class="ii">${ic}</div><p>${esc(t)}</p></div>`).join('')}<div class="row end" style="margin-top:16px"><button class="btn primary" data-act="closeModal">Got it</button></div>`),
  quickTask: () => form('New task', [{ k: 'title', label: 'Task', req: true }, { k: 'prio', label: 'Priority', type: 'select', options: [['high', '🔴 High'], ['med', '🟡 Medium'], ['low', '🔵 Low']], value: 'med' },
    { k: 'attr', label: 'Attribute', type: 'select', options: attrOpts, value: 'DIS' }, { k: 'due', label: 'Due', type: 'date', value: todayKey() }],
    v => { DATA.tasks.push({ id: uid(), ...v, xp: { high: 30, med: 20, low: 15 }[v.prio], done: false }); logAct('📝', `Added task “${v.title}”`); commit(); toast('Task added'); }),
  lock: async () => { await saveLocal(); await idb.del('key'); DATA = KEY = null; location.reload(); },
  forget: async () => { await idb.del('key'); toast('This device will ask for the passphrase next time'); },
  sync,
  ghPull,
  quest: ({ id }) => {
    const T = todayKey(), before = S.xp, lvl = S.level; DATA.log[T] ||= { q: {} }; DATA.log[T].q ||= {};
    DATA.log[T].q[id] = !DATA.log[T].q[id]; if (DATA.log[T].q[id]) { const q = DATA.quests.find(x => x.id === id); logAct(q?.icon || '⭐', `Quest done: ${q?.title}`); } commit();
    const diff = S.xp - before; if (diff > 0) { xpToast(diff); if (S.level === lvl) confetti(diff >= 50 ? 120 : 26); }
  },
  task: ({ id }) => { const t = DATA.tasks.find(x => x.id === id), before = S.xp; t.done = !t.done; t.doneAt = t.done ? todayKey() : null; if (t.done) logAct('✅', `Completed “${t.title}”`); commit(); const d = S.xp - before; if (d > 0) { xpToast(d); confetti(40); } },
  delTask: ({ id }) => { DATA.tasks = DATA.tasks.filter(t => t.id !== id); commit(); },
  tf: ({ v }) => { ui.taskFilter = v; render(); },
  addQuest: () => form('New daily quest', [{ k: 'title', label: 'Quest', req: true, ph: 'e.g. 10 min meditation' }, { k: 'icon', label: 'Emoji', value: '⭐' }, { k: 'attr', label: 'Attribute', type: 'select', options: attrOpts, value: 'DIS' }, { k: 'xp', label: 'XP', type: 'number', value: 15 }, { k: 'days', label: 'Days', type: 'select', options: [['all', 'Every day'], ['1,2,3,4,5,6', 'Mon–Sat'], ['1,2,3,4,5', 'Weekdays'], ['0,6', 'Weekends']], value: 'all' }],
    v => { DATA.quests.push({ id: uid(), ...v, days: v.days === 'all' ? undefined : v.days.split(',').map(Number), xp: v.xp || 10 }); commit(); }, `<p class="small dim" style="margin-bottom:12px">To remove or reorder quests, use the raw editor in Vault.</p>`),
  editStatus: () => form('Set your status', [{ k: 'emoji', label: 'Emoji', value: DATA.profile.status?.emoji }, { k: 'text', label: 'Status', value: DATA.profile.status?.text, ph: "What's your vibe?" }], v => { DATA.profile.status = v; commit(); }),
  editProfile: () => { const P = DATA.profile; form('Profile', [
    { k: 'name', label: 'Name', value: P.name, req: true }, { k: 'tagline', label: 'Tagline', value: P.tagline }, { k: 'dob', label: 'Date & time of birth', type: 'datetime-local', value: P.dob },
    { k: 'location', label: 'Location', value: P.location }, { k: 'avatar', label: 'Avatar emoji', value: P.avatar }, { k: 'photo', label: 'Photo URL (optional, e.g. your GitHub avatar)', value: P.photo },
    { k: 'heightCm', label: 'Height (cm)', type: 'number', value: P.heightCm }, { k: 'lifeYears', label: 'Life-expectancy horizon (years)', type: 'number', value: P.lifeYears || 80 }],
    v => { Object.assign(DATA.profile, v); DATA.meta.demo = false; commit(); }); },
  addGoal: () => goalForm(), editGoal: ({ id }) => goalForm(DATA.goals.find(g => g.id === id)),
  delGoal: ({ id }) => { if (confirm('Delete this goal?')) { DATA.goals = DATA.goals.filter(g => g.id !== id); commit(); } },
  ms: ({ id, i }) => { const g = DATA.goals.find(x => x.id === id), m = g.milestones[+i], b = S.xp; m.done = !m.done; if (m.done) logAct('🧭', `Milestone: ${m.t}`); commit(); const d = S.xp - b; if (d > 0) { xpToast(d); confetti(goalPct(g) >= 100 ? 200 : 50); } },
  gprog: ({ id, d }) => { const g = DATA.goals.find(x => x.id === id), b = S.xp; g.progress = clamp((+g.progress || 0) + +d, 0, 100); commit(); if (S.xp > b) { xpToast(S.xp - b); confetti(200); } },
  pickMetric: ({ k }, e) => { if (e.target.closest('[data-act="addEntry"]')) return; ui.metric = k; render(); },
  addEntry: ({ k }) => { const m = DATA.health.metrics.find(x => x.key === k); form(`Log ${m.label}`, [{ k: 'value', label: `Value (${m.unit})`, type: 'number', step: 'any', req: true }, { k: 'date', label: 'Date', type: 'date', value: todayKey() }],
    v => { if (v.value == null) return false; m.entries = m.entries.filter(x => x.date !== v.date); m.entries.push({ date: v.date, value: v.value }); logAct('📈', `${m.label}: ${v.value} ${m.unit}`); ui.metric = k; commit(); xpToast(5); }); },
  addMetric: () => form('New metric', [{ k: 'label', label: 'Name', req: true, ph: 'e.g. Waist' }, { k: 'unit', label: 'Unit', ph: 'cm' }, { k: 'target', label: 'Target (optional)', type: 'number', step: 'any' },
    { k: 'better', label: 'Better when', type: 'select', options: [['target', 'Closer to target'], ['lower', 'Lower'], ['higher', 'Higher']], value: 'target' }],
    v => { DATA.health.metrics.push({ key: uid(), ...v, entries: [] }); commit(); }),
  editMetric: ({ k }) => { const m = DATA.health.metrics.find(x => x.key === k); form(`Edit ${m.label}`, [{ k: 'label', label: 'Name', value: m.label }, { k: 'unit', label: 'Unit', value: m.unit }, { k: 'target', label: 'Target', type: 'number', step: 'any', value: m.target },
    { k: 'better', label: 'Better when', type: 'select', options: [['target', 'Closer to target'], ['lower', 'Lower'], ['higher', 'Higher']], value: m.better }],
    v => { Object.assign(m, v); commit(); }, `<button type="button" class="btn danger sm" style="margin-bottom:14px" data-act="delMetric" data-k="${k}">${icon('trash', 14)} Delete metric</button>`); },
  delMetric: ({ k }) => { if (!confirm('Delete this metric and all its entries?')) return; DATA.health.metrics = DATA.health.metrics.filter(m => m.key !== k); closeModal(); commit(); },
  addReport: () => form('Add lab report', [{ k: 'title', label: 'Title', req: true, ph: 'e.g. Blood panel · Apollo' }, { k: 'date', label: 'Date', type: 'date', value: todayKey() }, { k: 'notes', label: 'Notes', ph: 'Doctor comments…' },
    { k: 'markers', label: 'Markers: one per line → name, value, unit, min, max', type: 'textarea', ph: 'Vitamin D, 21, ng/mL, 30, 100\nHemoglobin, 14.6, g/dL, 13.5, 17.5' }],
    v => { const markers = (v.markers || '').split('\n').map(l => l.split(',').map(s => s.trim())).filter(p => p[0] && p[1] !== undefined && p[1] !== '')
      .map(([name, value, unit, min, max]) => ({ name, value: +value, unit: unit || '', min: min !== undefined && min !== '' ? +min : null, max: max !== undefined && max !== '' ? +max : null }));
      DATA.health.reports.push({ id: uid(), title: v.title, date: v.date, notes: v.notes, markers }); commit(); xpToast(25); }),
  delReport: ({ id }) => { if (confirm('Delete this report?')) { DATA.health.reports = DATA.health.reports.filter(r => r.id !== id); commit(); } },
  mood: ({ v }) => { const T = todayKey(); DATA.log[T] ||= { q: {} }; DATA.log[T].mood = v; commit(); },
  checkin: () => { const T = todayKey(); DATA.log[T] ||= { q: {} }; DATA.log[T].q ||= {}; const L = DATA.log[T], n = id => { const x = $(id).value; return x === '' ? undefined : +x; };
    L.sleepH = n('#ci-sleep'); L.waterL = n('#ci-water'); L.steps = n('#ci-steps'); L.note = $('#ci-note').value || undefined; logAct(L.mood || '📝', `Daily check-in${L.sleepH ? ` · slept ${L.sleepH}h` : ''}`);
    const b = S.xp; if (L.sleepH >= 7) L.q.sleep = DATA.quests.some(q => q.id === 'sleep') ? true : L.q.sleep; if (L.waterL >= 3) L.q.water = DATA.quests.some(q => q.id === 'water') ? true : L.q.water;
    commit(); toast('Check-in saved'); if (S.xp > b) xpToast(S.xp - b); },
  logWorkout: () => workoutForm(),
  delLog: ({ d, n }) => { if (confirm('Delete this session?')) { DATA.gym.logs = DATA.gym.logs.filter(l => !(l.date === d && l.day === n)); commit(); } },
  editSplit: () => { form('Weekly split', [{ k: 'split', label: 'One day per line → Weekday: Name | Exercise sets×reps@kg; …', type: 'textarea',
    value: [1, 2, 3, 4, 5, 6, 0].map(d => { const s = DATA.gym.split.find(x => +x.dow === d); return `${DOW[d]}: ${s?.name || 'Rest'}${s?.exercises.length ? ' | ' + s.exercises.map(e => `${e.name} ${e.sets}x${e.reps}${e.weight ? '@' + e.weight : ''}`).join('; ') : ''}`; }).join('\n') }],
    v => { const out = []; v.split.split('\n').forEach(line => { const m = line.match(/^\s*(\w{3})\w*\s*:\s*([^|]+)(?:\|(.*))?$/); if (!m) return; const dow = DOW.findIndex(x => x.toLowerCase() === m[1].toLowerCase()); if (dow < 0) return;
      const exercises = (m[3] || '').split(';').map(s => s.trim()).filter(Boolean).map(s => { const x = s.match(/^(.*?)\s+(\d+)\s*x\s*([\w-]+)(?:\s*@\s*([\d.]+))?$/i); return x ? { name: x[1], sets: +x[2], reps: x[3], weight: x[4] ? +x[4] : 0 } : { name: s, sets: 3, reps: '10', weight: 0 }; });
      out.push({ dow, name: m[2].trim(), exercises }); }); if (!out.length) { toast('Could not parse split'); return false; } DATA.gym.split = out; commit(); });
    $('#mf textarea').style.minHeight = '240px'; },
  addEvent: () => eventForm(), editEvent: ({ id }) => eventForm(DATA.journey.find(e => e.id === id)),
  delEvent: ({ id }) => { if (confirm('Delete this milestone?')) { DATA.journey = DATA.journey.filter(e => e.id !== id); commit(); } },
  changePass: () => form('Change passphrase', [{ k: 'p1', label: 'New passphrase (8+ chars)', type: 'password', req: true }, { k: 'p2', label: 'Repeat', type: 'password', req: true }], v => {
    if (v.p1.length < 8 || v.p1 !== v.p2) { toast('Passphrases must match and be 8+ characters'); return false; }
    (async () => { SALT = crypto.getRandomValues(new Uint8Array(16)); KEY = await deriveKey(v.p1, SALT); await idb.set('key', { key: KEY, salt: b64(SALT) });
      if (GH) ls.set(LS_GH, await encryptWith(KEY, SALT, GH)); commit(); toast('Passphrase changed. Sync to update the repo copy.'); })(); }),
  exportPlain: () => { if (confirm('This downloads your data UNENCRYPTED. Keep it private and never commit it. Continue?')) download('lifeos-data.json', JSON.stringify(DATA, null, 2)); },
  loadDemo: () => { if (confirm('Replace everything with sample data?')) { DATA = normalize(makeDemo()); commit(); } },
  applyRaw: () => { try { const d = JSON.parse($('#rawjson').value); DATA = normalize(d); commit(); toast('Applied ✔'); } catch (e) { toast('⚠️ ' + esc(e.message)); } },
  wDemo: () => setPass(normalize(makeDemo())),
  wBlank: () => { const d = makeDemo(); setPass(normalize({ profile: { name: 'You', dob: '', tagline: '', location: '', avatar: '🙂' }, quests: d.quests, routine: [], meta: { demo: false } })); },
};
function goalForm(g) {
  form(g ? 'Edit goal' : 'New goal', [{ k: 'title', label: 'Goal', value: g?.title, req: true }, { k: 'category', label: 'Category', value: g?.category || 'Personal' },
    { k: 'attr', label: 'Attribute', type: 'select', options: attrOpts, value: g?.attr || 'DIS' }, { k: 'start', label: 'Start', type: 'date', value: g?.start || todayKey() }, { k: 'due', label: 'Deadline', type: 'date', value: g?.due },
    { k: 'milestones', label: 'Milestones (one per line, prefix [x] if done). Leave empty to track % manually.', type: 'textarea', value: (g?.milestones || []).map(m => (m.done ? '[x] ' : '') + m.t).join('\n') }],
    v => { const ms = (v.milestones || '').split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ t: s.replace(/^\[x\]\s*/i, ''), done: /^\[x\]/i.test(s) }));
      const o = { title: v.title, category: v.category, attr: v.attr, start: v.start, due: v.due, milestones: ms };
      if (g) Object.assign(g, o); else DATA.goals.push({ id: uid(), progress: 0, ...o }); commit(); });
}
function eventForm(e) {
  form(e ? 'Edit milestone' : 'New milestone', [{ k: 'title', label: 'Title', value: e?.title, req: true }, { k: 'date', label: 'Date (YYYY, YYYY-MM or YYYY-MM-DD)', value: e?.date, ph: '2026-08' },
    { k: 'icon', label: 'Emoji', value: e?.icon || '⭐' }, { k: 'desc', label: 'Description', value: e?.desc }],
    v => { if (e) Object.assign(e, v); else DATA.journey.push({ id: uid(), ...v }); commit(); });
}
function workoutForm() {
  const plan = todayPlan(), opts = DATA.gym.split.filter(s => s.exercises.length);
  const rows = p => (p?.exercises || []).flatMap(e => Array.from({ length: +e.sets || 3 }, () => e)).map(e => setRow(e.name, e.weight, parseInt(e.reps) || 8)).join('');
  modal(`<h2>Log workout</h2><form id="wf"><div class="row"><div class="grow field"><label class="fl">Session</label><select class="in" id="wday">${opts.map(s => `<option${s === plan ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}<option>Custom</option></select></div>
    <div class="field"><label class="fl">Date</label><input class="in" type="date" id="wdate" value="${todayKey()}"></div></div>
    <div class="setrow small muted" style="margin-bottom:4px"><span>Exercise</span><span>kg</span><span>reps</span><span></span></div><div id="wsets">${rows(plan?.exercises.length ? plan : opts[0])}</div>
    <button type="button" class="btn sm" id="addset" style="margin:6px 0 16px">${icon('plus', 14)} Add set</button>
    <div class="row end"><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn primary">Save session</button></div></form>`);
  $('#wday').onchange = e => { $('#wsets').innerHTML = rows(opts.find(s => s.name === e.target.value)); };
  $('#addset').onclick = () => { const last = $$('#wsets .setrow').pop(); $('#wsets').insertAdjacentHTML('beforeend', setRow(last ? $('input', last).value : '', last ? $$('input', last)[1].value : '', last ? $$('input', last)[2].value : 8)); };
  $('#wsets').onclick = e => { if (e.target.closest('.rm')) e.target.closest('.setrow').remove(); };
  $('#wf').onsubmit = e => { e.preventDefault(); const sets = $$('#wsets .setrow').map(r => { const [a, b, c] = $$('input', r); return { ex: a.value.trim(), w: +b.value || 0, r: +c.value || 0 }; }).filter(s => s.ex && s.r);
    if (!sets.length) return toast('Add at least one set');
    const date = $('#wdate').value, day = $('#wday').value, before = S.xp; DATA.gym.logs.push({ date, day, sets }); logAct('🏋️', `Logged ${day} · ${sets.length} sets`);
    DATA.log[date] ||= { q: {} }; DATA.log[date].q ||= {}; if (DATA.quests.some(q => q.id === 'gym')) DATA.log[date].q.gym = true;
    closeModal(); commit(); xpToast(S.xp - before); confetti(90); };
}
const setRow = (n, w, r) => `<div class="setrow"><input class="in" value="${esc(n)}" placeholder="Exercise"><input class="in" type="number" step="0.5" value="${w || ''}" placeholder="kg"><input class="in" type="number" value="${r || ''}" placeholder="reps"><button type="button" class="btn icon sm rm" aria-label="Remove">${icon('x', 14)}</button></div>`;

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'A') e.preventDefault();
  e.stopPropagation(); fn(el.dataset, e);
});
window.addEventListener('hashchange', route);
let rzT; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if (VIEW === 'journey') drawWeeks(); }, 200); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DATA && VIEW === 'home') render(); });


/* ---------------- global header / search / status ---------------- */
function ago(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'just now'; if (s < 3600) return `${Math.round(s / 60)}m ago`; if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  const d = Math.round(s / 86400); return d === 1 ? 'yesterday' : `${d}d ago`;
}
function logAct(icon, text) { DATA.activity ||= []; DATA.activity.unshift({ t: Date.now(), icon, text }); DATA.activity.length = Math.min(DATA.activity.length, 40); }
function activityFeed(n = 5) {
  const a = [...(DATA.activity || [])];
  // fall back to events derived from data, so the card is never empty
  DATA.tasks.filter(t => t.done && t.doneAt).forEach(t => a.push({ t: pdate(t.doneAt).getTime() + 18 * 36e5, icon: '✅', text: `Completed “${t.title}”` }));
  DATA.gym.logs.forEach(l => a.push({ t: pdate(l.date).getTime() + 8 * 36e5, icon: '🏋️', text: `Logged ${l.day} · ${l.sets.length} sets` }));
  DATA.health.reports.forEach(r => a.push({ t: pdate(r.date)?.getTime() + 12 * 36e5, icon: '🩺', text: `Added report “${r.title}”` }));
  const seen = new Set();
  return a.filter(x => x.t && x.t <= Date.now() && !seen.has(x.text + Math.floor(x.t / 864e5)) && seen.add(x.text + Math.floor(x.t / 864e5))).sort((x, y) => y.t - x.t).slice(0, n);
}
function headerHTML() {
  const P = DATA.profile, bad = insights().some(i => i[2] === 'bad');
  return `<div class="hdr"><label class="search">${icon('search', 18)}<input id="q" type="search" placeholder="Search tasks, goals, lifts, reports…" autocomplete="off"><div class="sres glass hidden" id="sres"></div></label>
    <span class="sp"></span>
    <button class="icbtn" data-act="bell" aria-label="Insights">${icon('bell', 19)}${bad ? '<span class="badge"></span>' : ''}</button>
    <a class="icbtn hide-m" href="#/vault" aria-label="Settings">${icon('gear', 19)}</a>
    <button class="icbtn av" data-act="editProfile" aria-label="Profile">${P.photo ? `<img src="${esc(P.photo)}" alt="">` : esc(P.avatar || '🙂')}</button></div>`;
}
function statusHTML() {
  const on = navigator.onLine;
  return `<div class="statusbar glass${on ? '' : ' off'}"><span class="on"><i></i>${on ? 'Online' : 'Offline'}</span><span>🔒 Vault encrypted · ${DATA.meta.dirty ? 'unsynced changes' : 'synced'}</span><span>Last updated: ${ago(DATA.meta.updatedAt)}</span></div>`;
}
function sideRing() {
  const tq = DATA.log[todayKey()]?.q || {}, TQ = questsOn(todayKey()), pct = TQ.length ? Math.round(TQ.filter(q => tq[q.id]).length / TQ.length * 100) : 0;
  return ring(pct, { size: 150, sw: 14, color: TH.a1, label: pct + '%', sub: `today · lvl ${S.level}`, track: 'rgba(255,255,255,.07)' });
}
function searchIndex() {
  const out = [];
  DATA.tasks.forEach(t => out.push(['✅', t.title, 'task', 'tasks']));
  DATA.goals.forEach(g => { out.push(['🎯', g.title, 'goal', 'goals']); (g.milestones || []).forEach(m => out.push(['🧭', m.t, 'milestone', 'goals'])); });
  DATA.journey.forEach(e => out.push([e.icon || '📍', e.title, 'journey', 'journey']));
  DATA.quests.forEach(q => out.push([q.icon, q.title, 'quest', 'home']));
  DATA.meals.recipes.forEach(r => out.push(['🍳', `${r.name} · ${r.p}g protein`, 'recipe', 'meals']));
  DATA.health.metrics.forEach(m => out.push(['📈', m.label, 'metric', 'health']));
  DATA.health.reports.forEach(r => { out.push(['🩺', r.title, 'report', 'health']); r.markers.forEach(k => out.push(['🧪', `${k.name}: ${k.value} ${k.unit || ''}`, 'marker', 'health'])); });
  const ex = new Set(); DATA.gym.split.forEach(d => { out.push(['🗓️', `${DOW[d.dow]} · ${d.name}`, 'split', 'gym']); d.exercises.forEach(e => ex.add(e.name)); });
  ex.forEach(n => out.push(['🏋️', n + (S.prs[n] ? ` · PR ${fmt(S.prs[n].e, 1)} kg` : ''), 'lift', 'gym']));
  S.ach.forEach(a => out.push([a.em, a.name, a.got ? 'trophy ★' : 'trophy', 'trophies']));
  VIEWS.forEach(([k, n]) => out.push(['➜', n, 'page', k]));
  return out;
}
function wireSearch() {
  const q = $('#q'), box = $('#sres'); if (!q) return; let hits = [], hi = 0;
  const show = () => {
    const v = q.value.trim().toLowerCase(); if (!v) { box.classList.add('hidden'); return; }
    hits = searchIndex().filter(x => x[1].toLowerCase().includes(v)).slice(0, 12); hi = 0;
    box.innerHTML = hits.length ? hits.map((x, i) => `<a href="#/${x[3]}" class="${i === hi ? 'hl' : ''}"><span>${esc(x[0])}</span><span>${esc(x[1])}</span><span class="ty">${x[2]}</span></a>`).join('') : '<div class="empty">No matches</div>';
    box.classList.remove('hidden');
  };
  q.oninput = show; q.onfocus = show;
  q.onkeydown = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); hi = (hi + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % Math.max(1, hits.length); $$('a', box).forEach((a, i) => a.classList.toggle('hl', i === hi)); }
    if (e.key === 'Enter' && hits[hi]) { location.hash = '#/' + hits[hi][3]; if (hits[hi][3] === VIEW) render(); }
    if (e.key === 'Escape') { q.value = ''; box.classList.add('hidden'); q.blur(); }
  };
  q.onblur = () => setTimeout(() => box.classList.add('hidden'), 180);
}
window.addEventListener('online', () => DATA && render()); window.addEventListener('offline', () => DATA && render());
document.addEventListener('keydown', e => { if (e.key === '/' && DATA && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); $('#q')?.focus(); } });
setInterval(() => { const sb = $('.statusbar'); if (sb && DATA) sb.outerHTML = statusHTML(); }, 30000);

/* ---------------- forest scene + fireflies ---------------- */
let forestBuilt = false;
function buildForest() {
  if (forestBuilt) return; forestBuilt = true;
  let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const W = 1600, H = 1000;
  const tree = (x, w, lean, col) => {
    const top = -40, bot = H + 20, x2 = x + lean;
    let d = `M${x - w / 2},${bot} C${x - w / 2 + lean * .3},${H * .6} ${x2 - w * .35},${H * .3} ${x2 - w * .3},${top} L${x2 + w * .3},${top} C${x2 + w * .35},${H * .3} ${x + w / 2 + lean * .3},${H * .6} ${x + w / 2},${bot} Z`;
    let br = '';
    const nb = 2 + Math.floor(rnd() * 4);
    for (let i = 0; i < nb; i++) {
      const y = H * (.08 + rnd() * .55), dir = rnd() < .5 ? -1 : 1, len = 60 + rnd() * 220, bw = Math.max(2, w * (.12 + rnd() * .16));
      const bx = x + lean * (1 - y / H), ex = bx + dir * len, ey = y - 30 - rnd() * 120;
      br += `<path d="M${bx},${y} Q${bx + dir * len * .5},${y - 10 - rnd() * 40} ${ex},${ey}" stroke="${col}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;
      if (rnd() < .6) br += `<path d="M${bx + dir * len * .55},${y - 20} Q${bx + dir * len * .75},${y - 70} ${bx + dir * len * .7},${ey - 60 - rnd() * 60}" stroke="${col}" stroke-width="${bw * .55}" fill="none" stroke-linecap="round"/>`;
    }
    return `<path d="${d}" fill="${col}"/>${br}`;
  };
  const layer = (n, wMin, wMax, col, op, blur) => {
    let g = '';
    for (let i = 0; i < n; i++) g += tree(rnd() * W, wMin + rnd() * (wMax - wMin), (rnd() - .5) * 80, col);
    return `<g opacity="${op}" ${blur ? `filter="url(#b${blur})"` : ''}>${g}</g>`;
  };
  const bush = (col, y, amp) => { let d = `M0,${H}`; for (let x = 0; x <= W; x += 40) d += ` Q${x + 20},${y - rnd() * amp} ${x + 40},${y + rnd() * 10}`; return `<path d="${d} L${W},${H} Z" fill="${col}"/>`; };
  $('#forest').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice"><defs>
    <filter id="b3"><feGaussianBlur stdDeviation="6"/></filter><filter id="b2"><feGaussianBlur stdDeviation="2.5"/></filter>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8ab" stop-opacity="0"/><stop offset=".55" stop-color="#9fb8ab" stop-opacity=".10"/><stop offset="1" stop-color="#0b110e" stop-opacity=".4"/></linearGradient>
    <radialGradient id="glowg" cx=".12" cy=".85" r=".35"><stop offset="0" stop-color="#b5f35a" stop-opacity=".12"/><stop offset="1" stop-color="#b5f35a" stop-opacity="0"/></radialGradient></defs>
    ${layer(22, 10, 26, '#2d3d36', .55, 3)}<rect width="${W}" height="${H}" fill="url(#mist)"/>
    ${layer(12, 20, 44, '#18231e', .85, 2)}<rect width="${W}" height="${H}" fill="url(#mist)" opacity=".6"/>
    ${layer(6, 46, 90, '#080d0a', 1, 0)}
    ${bush('#0e1612', H - 70, 60)}${bush('#070b09', H - 30, 50)}<rect width="${W}" height="${H}" fill="url(#glowg)"/></svg>
    <div class="fog f1"></div><div class="fog f2"></div><div class="vig"></div>`;
}
const flies = {
  on: false, raf: 0, pts: [],
  start() {
    const c = $('#flies'); if (!c) return; this.c = c; this.ctx = c.getContext('2d');
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize(); if (!this._r) { this._r = () => this.resize(); addEventListener('resize', this._r); document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(this.raf); else if (this.on) this.loop(); }); }
    const n = innerWidth < 700 ? 22 : 46;
    this.pts = Array.from({ length: n }, () => ({ x: Math.random() * innerWidth, y: innerHeight * (.25 + Math.random() * .75), r: 1.1 + Math.random() * 2, s: .15 + Math.random() * .45, a: Math.random() * 6.28, p: Math.random() * 6.28, ps: .01 + Math.random() * .03 }));
    this.on = true; cancelAnimationFrame(this.raf); rm ? this.draw(0) : this.loop();
  },
  stop() { this.on = false; cancelAnimationFrame(this.raf); this.ctx?.clearRect(0, 0, innerWidth, innerHeight); },
  resize() { const d = devicePixelRatio || 1; this.c.width = innerWidth * d; this.c.height = innerHeight * d; this.ctx.setTransform(d, 0, 0, d, 0, 0); },
  draw(dt) {
    const x = this.ctx; x.clearRect(0, 0, innerWidth, innerHeight);
    for (const f of this.pts) {
      if (dt) { f.a += (Math.random() - .5) * .25; f.x += Math.cos(f.a) * f.s; f.y += Math.sin(f.a) * f.s * .7 - .05; f.p += f.ps;
        if (f.x < -20) f.x = innerWidth + 20; if (f.x > innerWidth + 20) f.x = -20; if (f.y < innerHeight * .15) f.a = Math.PI / 2; if (f.y > innerHeight + 10) f.y = innerHeight * .3; }
      const glow = .35 + .65 * Math.max(0, Math.sin(f.p)) ** 2, R = f.r * 9;
      const g = x.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
      g.addColorStop(0, `rgba(214,255,140,${.9 * glow})`); g.addColorStop(.25, `rgba(181,243,90,${.35 * glow})`); g.addColorStop(1, 'rgba(181,243,90,0)');
      x.fillStyle = g; x.beginPath(); x.arc(f.x, f.y, R, 0, 6.29); x.fill();
      x.fillStyle = `rgba(245,255,220,${glow})`; x.beginPath(); x.arc(f.x, f.y, f.r * .7, 0, 6.29); x.fill();
    }
  },
  loop() { this.draw(1); this.raf = requestAnimationFrame(() => this.on && this.loop()); },
};

/* ---------------- fx: toast + confetti + weeks ---------------- */
function toast(html) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2900); }
function xpToast(n) { if (n > 0) toast(`<span class="x">+${n} XP</span> ${n >= 50 ? 'Huge!' : 'Nice.'}`); }
let confettiParts = [], confettiOn = false;
function confetti(n = 100) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#fx'), ctx = c.getContext('2d'), dpr = devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = TH.confetti;
  for (let i = 0; i < n; i++) confettiParts.push({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, g: .32, s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[i % cols.length], life: 110 + Math.random() * 60 });
  if (confettiOn) return; confettiOn = true;
  (function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    confettiParts = confettiParts.filter(p => p.life-- > 0 && p.y < innerHeight + 20);
    confettiParts.forEach(p => { p.vy += p.g; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.min(1, p.life / 40); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
    if (confettiParts.length) requestAnimationFrame(loop); else { confettiOn = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  })();
}
function drawWeeks() {
  const c = $('#weeks'); if (!c) return; const ap = ageParts(); if (!ap) return;
  const years = DATA.profile.lifeYears || 80, cols = 52, W = c.clientWidth, cell = W / cols, H = Math.ceil(cell * years), dpr = devicePixelRatio || 1;
  c.width = W * dpr; c.height = H * dpr; c.style.height = H + 'px'; const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const lived = Math.floor(ap.days / 7), rad = Math.max(0.8, cell * 0.32);
  const markers = new Set(DATA.journey.filter(e => pdate(e.date)).map(e => Math.floor((pdate(e.date) - dob()) / (7 * 864e5))));
  let i = 0; const total = years * cols;
  (function frame() {
    const end = Math.min(total, i + 420);
    for (; i < end; i++) {
      const x = (i % cols) * cell + cell / 2, y = Math.floor(i / cols) * cell + cell / 2;
      ctx.beginPath(); ctx.arc(x, y, markers.has(i) ? rad * 1.5 : rad, 0, Math.PI * 2);
      if (markers.has(i)) ctx.fillStyle = THEME === 'forest' ? '#ffffff' : TH.warn;
      else if (i < lived) { const t = i / Math.max(1, lived); ctx.fillStyle = TH.week(t); }
      else if (i === lived) ctx.fillStyle = TH.a2;
      else ctx.fillStyle = 'rgba(255,255,255,.17)';
      ctx.fill();
    }
    if (i < total) requestAnimationFrame(frame);
  })();
}

/* ---------------- go ---------------- */
applyTheme((() => { try { return localStorage.getItem('lifeos.theme'); } catch { return null; } })() || 'forest');
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.addEventListener('DOMContentLoaded', boot);
