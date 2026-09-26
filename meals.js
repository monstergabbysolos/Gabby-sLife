/* =====================================================================
   LifeOS · Meals: macro targets, weekly plan, recipe book, grocery list
   Loaded after app.js (shares its globals).
   ===================================================================== */
'use strict';

const SLOTS = [['breakfast', 'Breakfast', '🍳'], ['lunch', 'Lunch', '🍛'], ['snack', 'Snack', '🥤'], ['dinner', 'Dinner', '🍽️']];
const UNITS = ['g', 'kg', 'ml', 'l', 'pc', 'tbsp', 'tsp', 'scoop', 'slice', 'cup', 'clove'];

/* Approximate macros per serving. High-protein, Indian-friendly, student-budget. */
const RECIPES = [
  { id: 'oats', name: 'Protein overnight oats', slot: 'breakfast', time: 5, kcal: 720, p: 48, c: 90, f: 20, tags: ['no-cook', 'prep ahead'],
    ing: [[80, 'g', 'rolled oats'], [1, 'scoop', 'whey protein'], [250, 'ml', 'milk'], [1, 'pc', 'banana'], [15, 'g', 'peanut butter'], [10, 'g', 'chia seeds']],
    steps: ['Mix oats, whey, chia and milk in a jar.', 'Refrigerate overnight (or 30 min minimum).', 'Top with sliced banana and peanut butter in the morning.'] },
  { id: 'bhurji', name: 'Masala egg bhurji & toast', slot: 'breakfast', time: 15, kcal: 620, p: 38, c: 50, f: 28, tags: ['quick'],
    ing: [[4, 'pc', 'eggs'], [1, 'pc', 'onion'], [1, 'pc', 'tomato'], [1, 'pc', 'green chilli'], [3, 'slice', 'wholemeal bread'], [5, 'g', 'ghee'], [5, 'g', 'coriander leaves']],
    steps: ['Heat ghee, sauté chopped onion and chilli till soft.', 'Add tomato, turmeric, chilli powder, salt; cook 2 min.', 'Add beaten eggs, scramble on low heat till just set.', 'Finish with coriander; serve with toast.'] },
  { id: 'chkcurry', name: 'Chettinad-style chicken curry + rice', slot: 'lunch', time: 35, kcal: 780, p: 52, c: 90, f: 20, tags: ['batch cook'],
    ing: [[200, 'g', 'chicken'], [100, 'g', 'basmati rice'], [1, 'pc', 'onion'], [1, 'pc', 'tomato'], [10, 'g', 'ginger-garlic paste'], [10, 'ml', 'oil'], [30, 'g', 'curd'], [10, 'g', 'chettinad masala']],
    steps: ['Marinate chicken in curd, salt and half the masala (15 min+).', 'Sauté onion in oil till golden; add ginger-garlic paste.', 'Add tomato and remaining masala; cook to a thick base.', 'Add chicken + ½ cup water; simmer covered 15–18 min.', 'Serve with steamed rice. Cook 3× batch on Sunday.'] },
  { id: 'paneer', name: 'Paneer tikka rice bowl', slot: 'dinner', time: 25, kcal: 820, p: 42, c: 75, f: 38, tags: ['veg'],
    ing: [[150, 'g', 'paneer'], [100, 'g', 'curd'], [1, 'pc', 'capsicum'], [1, 'pc', 'onion'], [80, 'g', 'basmati rice'], [10, 'g', 'tikka masala'], [5, 'ml', 'oil']],
    steps: ['Coat paneer, capsicum and onion cubes in curd + tikka masala.', 'Pan-sear or air-fry 10–12 min until charred.', 'Serve over rice with extra curd and lemon.'] },
  { id: 'soya', name: 'Soya chunk pulao', slot: 'lunch', time: 25, kcal: 690, p: 45, c: 95, f: 14, tags: ['veg', 'budget'],
    ing: [[60, 'g', 'soya chunks'], [90, 'g', 'basmati rice'], [50, 'g', 'green peas'], [1, 'pc', 'onion'], [10, 'ml', 'oil'], [100, 'g', 'curd'], [5, 'g', 'garam masala']],
    steps: ['Soak soya in hot water 10 min; squeeze dry.', 'Sauté onion and whole spices; add soya and peas.', 'Add washed rice + 1.75× water, garam masala, salt.', 'Cook covered 12 min (or 2 whistles). Serve with curd.'] },
  { id: 'chana', name: 'Chana masala, rotis & boiled eggs', slot: 'dinner', time: 30, kcal: 850, p: 42, c: 105, f: 24, tags: ['batch cook'],
    ing: [[150, 'g', 'boiled chickpeas'], [90, 'g', 'atta (wheat flour)'], [2, 'pc', 'eggs'], [1, 'pc', 'onion'], [1, 'pc', 'tomato'], [10, 'ml', 'oil'], [100, 'g', 'curd'], [5, 'g', 'chana masala']],
    steps: ['Sauté onion, add tomato and chana masala; cook down.', 'Add chickpeas + water, mash a few, simmer 10 min.', 'Knead atta, roll and cook 3 rotis.', 'Serve with curd and 2 boiled eggs.'] },
  { id: 'shake', name: 'PB banana power shake', slot: 'snack', time: 3, kcal: 600, p: 45, c: 65, f: 18, tags: ['no-cook', 'post-workout'],
    ing: [[300, 'ml', 'milk'], [1, 'scoop', 'whey protein'], [1, 'pc', 'banana'], [20, 'g', 'peanut butter'], [30, 'g', 'rolled oats']],
    steps: ['Blend everything for 45 seconds.', 'Drink within an hour of training.'] },
  { id: 'friedrice', name: 'Egg & chicken fried rice', slot: 'dinner', time: 20, kcal: 780, p: 55, c: 80, f: 24, tags: ['quick', 'leftover rice'],
    ing: [[90, 'g', 'basmati rice'], [3, 'pc', 'eggs'], [100, 'g', 'chicken'], [100, 'g', 'mixed vegetables'], [10, 'ml', 'soy sauce'], [10, 'ml', 'oil'], [1, 'pc', 'spring onion']],
    steps: ['Use cold cooked rice (cook earlier or use leftovers).', 'Stir-fry diced chicken on high heat; push aside and scramble eggs.', 'Add veg, then rice and soy sauce; toss 3 min.', 'Top with spring onion.'] },
  { id: 'prep', name: 'Meal-prep chicken, sweet potato & broccoli', slot: 'lunch', time: 40, kcal: 620, p: 52, c: 60, f: 14, tags: ['meal prep', 'lean'],
    ing: [[200, 'g', 'chicken breast'], [250, 'g', 'sweet potato'], [150, 'g', 'broccoli'], [10, 'ml', 'olive oil'], [5, 'g', 'peri-peri spice']],
    steps: ['Season chicken; bake/air-fry at 200 °C for 18–20 min.', 'Roast sweet potato cubes 25 min alongside.', 'Steam broccoli 4 min.', 'Box into containers: good for 3 days in the fridge.'] },
  { id: 'parfait', name: 'Greek yogurt parfait', slot: 'snack', time: 5, kcal: 520, p: 28, c: 55, f: 20, tags: ['no-cook'],
    ing: [[200, 'g', 'greek yogurt'], [40, 'g', 'granola'], [100, 'g', 'seasonal fruit'], [15, 'g', 'honey'], [20, 'g', 'almonds']],
    steps: ['Layer yogurt, fruit and granola.', 'Top with almonds and honey.'] },
  { id: 'dal', name: 'Dal, rice, spinach & eggs (budget)', slot: 'dinner', time: 30, kcal: 760, p: 38, c: 105, f: 20, tags: ['budget', 'comfort'],
    ing: [[60, 'g', 'toor dal'], [90, 'g', 'basmati rice'], [2, 'pc', 'eggs'], [100, 'g', 'spinach'], [10, 'g', 'ghee'], [1, 'pc', 'tomato']],
    steps: ['Pressure-cook dal with turmeric and tomato (3 whistles).', 'Temper with ghee, mustard seeds, cumin, garlic; add spinach.', 'Serve with rice and 2 fried/boiled eggs.'] },
  { id: 'wrap', name: 'Chicken tikka wraps', slot: 'lunch', time: 20, kcal: 640, p: 50, c: 55, f: 20, tags: ['portable'],
    ing: [[2, 'pc', 'wholemeal tortillas'], [180, 'g', 'chicken'], [60, 'g', 'curd'], [1, 'pc', 'onion'], [40, 'g', 'lettuce'], [20, 'g', 'mint chutney'], [10, 'g', 'tikka masala']],
    steps: ['Marinate chicken strips in curd + tikka masala.', 'Sear on high heat 8–10 min.', 'Fill tortillas with lettuce, onion, chicken and chutney; roll tight.'] },
  { id: 'keema', name: 'Mutton keema & peas with lemon (iron-rich)', slot: 'dinner', time: 35, kcal: 760, p: 48, c: 70, f: 30, tags: ['iron', 'batch cook'],
    ing: [[180, 'g', 'mutton mince'], [60, 'g', 'green peas'], [1, 'pc', 'onion'], [1, 'pc', 'tomato'], [10, 'g', 'ginger-garlic paste'], [5, 'ml', 'oil'], [1, 'pc', 'lemon'], [2, 'pc', 'wholemeal rotis']],
    steps: ['Sauté onion till golden, add ginger-garlic paste and spices.', 'Add mince, brown well; add tomato and peas, simmer 15 min.', 'Squeeze lemon over before eating: vitamin C helps you absorb the iron.', 'Serve with rotis. Skip tea/coffee for an hour either side (it blocks iron).'] },
  { id: 'fish', name: 'Grilled salmon or saba, rice & greens (omega-3)', slot: 'dinner', time: 20, kcal: 720, p: 45, c: 70, f: 26, tags: ['omega-3', 'HDL-friendly'],
    ing: [[180, 'g', 'salmon or saba fillet'], [90, 'g', 'basmati rice'], [150, 'g', 'kai lan or spinach'], [10, 'ml', 'olive oil'], [1, 'pc', 'lemon'], [5, 'g', 'turmeric-chilli rub']],
    steps: ['Rub fish with turmeric, chilli, salt and lemon.', 'Pan-grill 3–4 min per side (or air-fry 12 min at 200 °C).', 'Stir-fry greens with garlic in olive oil.', 'Serve with rice. Aim for oily fish twice a week.'] },
  { id: 'chaat', name: 'Chana-peanut chaat', slot: 'snack', time: 8, kcal: 400, p: 18, c: 40, f: 16, tags: ['quick', 'veg'],
    ing: [[100, 'g', 'boiled chickpeas'], [30, 'g', 'roasted peanuts'], [1, 'pc', 'onion'], [1, 'pc', 'tomato'], [1, 'pc', 'lemon'], [3, 'g', 'chaat masala']],
    steps: ['Toss everything together with lemon juice and chaat masala.'] },
];
const DEFAULT_PLAN = {
  Mon: { breakfast: 'oats',   lunch: 'chkcurry', snack: 'shake',   dinner: 'friedrice' },
  Tue: { breakfast: 'bhurji', lunch: 'prep',     snack: 'parfait', dinner: 'soya' },
  Wed: { breakfast: 'oats',   lunch: 'paneer',   snack: 'shake',   dinner: 'fish' },
  Thu: { breakfast: 'bhurji', lunch: 'prep',     snack: 'chaat',   dinner: 'chkcurry' },
  Fri: { breakfast: 'oats',   lunch: 'soya',     snack: 'shake',   dinner: 'wrap' },
  Sat: { breakfast: 'bhurji', lunch: 'dal',      snack: 'parfait', dinner: 'keema' },
  Sun: { breakfast: 'oats',   lunch: 'chana',    snack: 'chaat',   dinner: 'fish' },
};
function defaultMeals() {
  return { goal: 'lean bulk', surplus: 300, proteinPerKg: 2, activity: 1.55,
    recipes: RECIPES.map(r => ({ ...r, ing: r.ing.map(([q, u, n]) => ({ q, u, n })) })), plan: JSON.parse(JSON.stringify(DEFAULT_PLAN)), eaten: {}, grocery: {} };
}
function normalizeMeals(d) {
  const def = defaultMeals();
  d.meals = { ...def, ...(d.meals || {}) };
  d.meals.recipes ||= def.recipes; d.meals.plan ||= def.plan; d.meals.eaten ||= {}; d.meals.grocery ||= {};
  d.meals.recipes.forEach(r => { r.id ||= uid(); r.ing = (r.ing || []).map(x => Array.isArray(x) ? { q: x[0], u: x[1], n: x[2] } : x); r.steps ||= []; r.tags ||= []; });
}

/* ---------- maths ---------- */
const recipe = id => DATA.meals.recipes.find(r => r.id === id);
const planFor = dk => DATA.meals.plan[DOW[pdate(dk).getDay()]] || {};
function latestWeight() { const w = DATA.health.metrics.find(m => m.key === 'weight'); return w && [...w.entries].sort((a, b) => a.date.localeCompare(b.date)).pop()?.value; }
function nutrition() {
  const P = DATA.profile, M = DATA.meals, w = latestWeight() || 70, h = P.heightCm || 175, ap = ageParts(), age = ap ? ap.y : 25;
  const bmr = 10 * w + 6.25 * h - 5 * age + (P.sex === 'f' ? -161 : 5);   // Mifflin-St Jeor
  const tdee = bmr * (M.activity || 1.55), kcal = Math.round((tdee + (+M.surplus || 0)) / 10) * 10;
  const protein = Math.round(w * (M.proteinPerKg || 2)), fat = Math.round(kcal * 0.25 / 9), carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
  return { w, bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs };
}
function sumRecipes(ids) { return ids.map(recipe).filter(Boolean).reduce((a, r) => ({ kcal: a.kcal + r.kcal, p: a.p + r.p, c: a.c + r.c, f: a.f + r.f }), { kcal: 0, p: 0, c: 0, f: 0 }); }
function eatenIds(dk) { const e = DATA.meals.eaten[dk] || {}; return Object.values(e).filter(Boolean); }
function groceryList() {
  const agg = {};
  Object.values(DATA.meals.plan).forEach(day => Object.values(day).forEach(id => { const r = recipe(id); if (!r) return;
    r.ing.forEach(i => { const k = `${i.n.toLowerCase()}|${i.u}`; agg[k] ||= { n: i.n, u: i.u, q: 0, uses: 0 }; agg[k].q += +i.q || 0; agg[k].uses++; }); }));
  return Object.entries(agg).map(([k, v]) => ({ k, ...v })).sort((a, b) => a.n.localeCompare(b.n));
}
const fmtQty = (q, u) => u === 'g' && q >= 1000 ? `${fmt(q / 1000, 2)} kg` : u === 'ml' && q >= 1000 ? `${fmt(q / 1000, 2)} L` : `${fmt(q, q % 1 ? 1 : 0)} ${u === 'pc' ? '×' : u}`;

/* ---------- view ---------- */
ui.recipeFilter = 'all';
V.meals = () => {
  const N = nutrition(), T = todayKey(), plan = planFor(T), E = DATA.meals.eaten[T] || {};
  const ate = sumRecipes(eatenIds(T)), planned = sumRecipes(SLOTS.map(([s]) => plan[s]));
  const gap = N.kcal - planned.kcal, order = [1, 2, 3, 4, 5, 6, 0];
  const G = groceryList(), got = G.filter(g => DATA.meals.grocery[g.k]).length;
  const R = DATA.meals.recipes.filter(r => ui.recipeFilter === 'all' || r.slot === ui.recipeFilter);
  return `${hdr('Meals', `${esc(DATA.meals.goal || 'Nutrition')} · ${fmt(N.kcal)} kcal · ${N.protein} g protein a day`, `<button class="btn" data-act="mealSettings">${icon('edit', 16)} Targets</button><button class="btn primary" data-act="addRecipe">${icon('plus', 16)} Recipe</button>`)}
  <div class="grid g-home">
    <section class="card glass s4"><h3>${icon('target', 16)} Today's fuel</h3>
      <div class="row" style="justify-content:space-around;gap:10px">
        ${ring(ate.kcal / N.kcal * 100, { size: 118, sw: 11, color: TH.a1, label: fmt(ate.kcal), sub: `/ ${fmt(N.kcal)} kcal` })}
        ${ring(ate.p / N.protein * 100, { size: 118, sw: 11, color: ATTRS.INT.color, label: ate.p + 'g', sub: `/ ${N.protein}g protein` })}
      </div>
      <div class="kv"><div><b>${ate.c}g</b><span>of ${N.carbs}g carbs</span></div><div><b>${ate.f}g</b><span>of ${N.fat}g fat</span></div><div><b>${fmt(N.tdee)}</b><span>maintenance</span></div></div>
      <p class="small muted" style="margin-top:12px">Estimate uses your weight (${N.w} kg), height, age and training days. For a lean bulk, aim for <b>+0.25–0.35 kg per week</b>. If the scale stalls for 2 weeks, add ~150 kcal.</p></section>

    <section class="card glass s8"><h3>${icon('clock', 16)} Today's menu · ${DOW[new Date().getDay()]}<span class="sp"></span><span class="chip">plan ${fmt(planned.kcal)} kcal · ${planned.p}g P</span></h3>
      ${SLOTS.map(([s, n, ic]) => { const r = recipe(plan[s]); const done = !!E[s];
        return `<div class="quest${done ? ' done' : ''}" style="--c:${TH.a1};cursor:default"><div class="ck" data-act="eat" data-s="${s}" style="cursor:pointer">${icon('check', 14)}</div><span class="ic">${ic}</span>
          <span class="qt"><span class="small muted" style="display:block;text-decoration:none">${n}</span>${r ? esc(r.name) : '<i class="dim">Nothing planned</i>'}</span>
          ${r ? `<span class="small muted mono hide-m">${r.kcal} kcal · ${r.p}g P</span><button class="btn sm" data-act="viewRecipe" data-id="${r.id}">Recipe</button>` : ''}
          <button class="btn sm icon" data-act="swapMeal" data-d="${DOW[new Date().getDay()]}" data-s="${s}" aria-label="Swap">${icon('edit', 13)}</button></div>`; }).join('')}
      <div class="small muted" style="margin-top:6px">${gap > 80 ? `Plan is <b>${fmt(gap)} kcal short</b> of target. Easy top-up: a glass of milk + a handful of nuts (~350 kcal) before bed.` : gap < -250 ? `Plan is ${fmt(-gap)} kcal over target. Fine on heavy leg days.` : '✅ Plan matches your target.'}</div></section>

    <section class="card glass s12"><h3>🗓️ Weekly plan <span class="sp"></span><span class="small muted">Tap a meal to swap it</span></h3>
      <div style="overflow-x:auto"><div class="mealweek">${order.map(d => { const k = DOW[d], p = DATA.meals.plan[k] || {}, t = sumRecipes(SLOTS.map(([s]) => p[s])), today = d === new Date().getDay();
        return `<div class="mday${today ? ' today' : ''}"><b>${k.toUpperCase()}</b>${SLOTS.map(([s, , ic]) => { const r = recipe(p[s]); return `<button class="mcell" data-act="swapMeal" data-d="${k}" data-s="${s}"><span>${ic}</span>${r ? esc(r.name) : '—'}</button>`; }).join('')}
          <div class="small muted mono" style="margin-top:6px">${fmt(t.kcal)} kcal · ${t.p}g</div></div>`; }).join('')}</div></div></section>

    <section class="card glass s7"><h3>📖 Recipe book <span class="sp"></span><div class="tabs">${[['all', 'All'], ...SLOTS.map(([s, n]) => [s, n])].map(([v, n]) => `<button data-act="rf" data-v="${v}" class="${ui.recipeFilter === v ? 'on' : ''}">${n}</button>`).join('')}</div></h3>
      <div class="grid auto" style="gap:10px">${R.map(r => `<button class="recipe" data-act="viewRecipe" data-id="${r.id}"><div class="between"><b>${esc(r.name)}</b><span class="chip">${r.time}′</span></div>
        <div class="row small muted" style="gap:10px;margin-top:6px"><span>🔥 ${r.kcal}</span><span>💪 ${r.p}g P</span><span>🍚 ${r.c}g C</span><span>🥑 ${r.f}g F</span></div>
        <div class="row" style="gap:5px;margin-top:8px">${r.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></button>`).join('') || '<div class="empty">No recipes</div>'}</div></section>

    <section class="card glass s5"><h3>🛒 Grocery list · this week <span class="sp"></span><span class="chip">${got}/${G.length}</span><button class="btn sm" data-act="groceryReset">Reset</button></h3>
      ${G.map(g => `<div class="ms${DATA.meals.grocery[g.k] ? ' done' : ''}" data-act="grocery" data-k="${esc(g.k)}"><div class="bx">${icon('check', 11)}</div><span class="grow">${esc(g.n)}</span><span class="small muted mono">${fmtQty(g.q, g.u)}</span></div>`).join('')}
      <p class="small dim" style="margin-top:10px">Totals for the whole week's plan. Buy chicken in bulk and freeze in 200 g portions.</p></section>
  </div>`;
};

function recipeModal(r) {
  modal(`<h2>${esc(r.name)}</h2><div class="row" style="gap:6px;margin-bottom:14px"><span class="chip">⏱ ${r.time} min</span><span class="chip">🔥 ${r.kcal} kcal</span><span class="chip">💪 ${r.p}g protein</span><span class="chip">🍚 ${r.c}g</span><span class="chip">🥑 ${r.f}g</span></div>
    <h3 class="small muted" style="margin:6px 0">INGREDIENTS · 1 serving</h3>${r.ing.map(i => `<div class="ex"><span>${esc(i.n)}</span><span class="muted mono">${fmtQty(i.q, i.u)}</span></div>`).join('')}
    <h3 class="small muted" style="margin:16px 0 6px">METHOD</h3><ol style="padding-left:20px;display:grid;gap:8px">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="small dim" style="margin-top:14px">Macros are approximate.</p>
    <div class="row end" style="margin-top:16px"><button class="btn danger sm" data-act="delRecipe" data-id="${r.id}">${icon('trash', 14)} Delete</button><button class="btn" data-act="editRecipe" data-id="${r.id}">${icon('edit', 14)} Edit</button><button class="btn primary" data-act="closeModal">Close</button></div>`);
}
function recipeForm(r) {
  form(r ? 'Edit recipe' : 'New recipe', [
    { k: 'name', label: 'Name', value: r?.name, req: true },
    { k: 'slot', label: 'Meal', type: 'select', options: SLOTS.map(([s, n]) => [s, n]), value: r?.slot || 'lunch' },
    { k: 'time', label: 'Minutes', type: 'number', value: r?.time ?? 20 },
    { k: 'kcal', label: 'Calories', type: 'number', value: r?.kcal }, { k: 'p', label: 'Protein (g)', type: 'number', value: r?.p },
    { k: 'c', label: 'Carbs (g)', type: 'number', value: r?.c }, { k: 'f', label: 'Fat (g)', type: 'number', value: r?.f },
    { k: 'tags', label: 'Tags (comma separated)', value: (r?.tags || []).join(', ') },
    { k: 'ing', label: 'Ingredients: one per line, e.g. "200 g chicken"', type: 'textarea', value: (r?.ing || []).map(i => `${i.q} ${i.u} ${i.n}`).join('\n') },
    { k: 'steps', label: 'Steps: one per line', type: 'textarea', value: (r?.steps || []).join('\n') }],
    v => {
      const ing = (v.ing || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^([\d.\/]+)\s*([a-zA-Z]+)?\s+(.+)$/);
        if (!m) return { q: 1, u: 'pc', n: l }; let [, q, u, n] = m; q = q.includes('/') ? q.split('/').reduce((a, b) => a / b) : +q;
        if (u && !UNITS.includes(u.toLowerCase())) { n = `${u} ${n}`; u = 'pc'; } return { q, u: (u || 'pc').toLowerCase(), n }; });
      const o = { name: v.name, slot: v.slot, time: v.time || 0, kcal: v.kcal || 0, p: v.p || 0, c: v.c || 0, f: v.f || 0, tags: (v.tags || '').split(',').map(s => s.trim()).filter(Boolean), ing, steps: (v.steps || '').split('\n').map(s => s.trim()).filter(Boolean) };
      if (r) Object.assign(r, o); else DATA.meals.recipes.push({ id: uid(), ...o }); commit(); toast('Recipe saved');
    });
}
Object.assign(A, {
  rf: ({ v }) => { ui.recipeFilter = v; render(); },
  viewRecipe: ({ id }) => { const r = recipe(id); if (r) recipeModal(r); },
  editRecipe: ({ id }) => recipeForm(recipe(id)),
  addRecipe: () => recipeForm(),
  delRecipe: ({ id }) => { if (!confirm('Delete this recipe? It will be removed from your plan too.')) return;
    DATA.meals.recipes = DATA.meals.recipes.filter(r => r.id !== id); Object.values(DATA.meals.plan).forEach(d => Object.keys(d).forEach(s => { if (d[s] === id) d[s] = ''; })); closeModal(); commit(); },
  swapMeal: ({ d, s }) => { const cur = DATA.meals.plan[d]?.[s] || '';
    const opts = [['', '— Nothing —'], ...DATA.meals.recipes.slice().sort((a, b) => (a.slot === s ? 0 : 1) - (b.slot === s ? 0 : 1) || a.name.localeCompare(b.name)).map(r => [r.id, `${r.slot === s ? '★ ' : ''}${r.name} · ${r.kcal} kcal · ${r.p}g P`])];
    form(`${d} · ${SLOTS.find(x => x[0] === s)[1]}`, [{ k: 'id', label: 'Recipe (★ = made for this meal)', type: 'select', options: opts, value: cur }],
      v => { DATA.meals.plan[d] ||= {}; DATA.meals.plan[d][s] = v.id; commit(); }); },
  eat: ({ s }) => {
    const T = todayKey(), id = planFor(T)[s]; if (!id) return toast('Plan a meal first');
    DATA.meals.eaten[T] ||= {}; const was = DATA.meals.eaten[T][s]; DATA.meals.eaten[T][s] = was ? null : id;
    const before = S.xp;
    if (!was) { logAct('🍽️', `Ate ${recipe(id)?.name}`);
      const P = sumRecipes(eatenIds(T)).p, N = nutrition(); const pq = DATA.quests.find(q => q.id === 'protein');
      if (pq && P >= N.protein) { DATA.log[T] ||= { q: {} }; DATA.log[T].q ||= {}; if (!DATA.log[T].q.protein) { DATA.log[T].q.protein = true; setTimeout(() => toast(`💪 Protein target hit: ${P}g`), 500); } } }
    commit(); if (S.xp > before) xpToast(S.xp - before);
  },
  grocery: ({ k }) => { DATA.meals.grocery[k] = !DATA.meals.grocery[k]; commit(); },
  groceryReset: () => { DATA.meals.grocery = {}; commit(); },
  mealSettings: () => { const M = DATA.meals; form('Nutrition targets', [
    { k: 'goal', label: 'Phase', type: 'select', options: [['lean bulk', 'Lean bulk'], ['maintain', 'Maintain'], ['cut', 'Cut']], value: M.goal },
    { k: 'surplus', label: 'Daily surplus (kcal, negative for a deficit)', type: 'number', value: M.surplus },
    { k: 'proteinPerKg', label: 'Protein (g per kg bodyweight)', type: 'number', step: '0.1', value: M.proteinPerKg },
    { k: 'activity', label: 'Activity multiplier (1.55 = training 5–6 days)', type: 'number', step: '0.05', value: M.activity }],
    v => { Object.assign(M, v); commit(); }); },
});
