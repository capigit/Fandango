/* ── CSV ── */
async function loadData() {
  const r = await fetch('./fandango_data.csv');
  if (!r.ok) throw new Error('CSV introuvable');
  const txt = await r.text();
  const lines = txt.trim().split('\n').slice(1);
  return lines.map(line => {
    const parts  = line.split(',');
    const votes  = parseInt(parts[parts.length - 1]);
    const rating = parseFloat(parts[parts.length - 2]);
    const stars  = parseFloat(parts[parts.length - 3]);
    const film   = parts.slice(0, parts.length - 3).join(',').replace(/^"|"$/g, '').trim();
    if (isNaN(stars) || isNaN(rating)) return null;
    return { film, stars, rating, votes, gap: parseFloat((stars - rating).toFixed(2)) };
  }).filter(Boolean);
}

/* ── STATS ── */
function computeStats(data) {
  const v      = data.filter(d => d.votes > 0);
  const inf    = v.filter(d => d.gap > 0);
  const avgGap = v.reduce((s, d) => s + d.gap, 0) / v.length;
  const maxGap = Math.max(...v.map(d => d.gap));
  const worst  = v.find(d => d.gap === maxGap);
  const avgS   = v.reduce((s, d) => s + d.stars, 0) / v.length;
  const avgR   = v.reduce((s, d) => s + d.rating, 0) / v.length;
  return {
    total: data.length,
    withVotes: v.length,
    infCount: inf.length,
    infPct: Math.round(inf.length / v.length * 100),
    avgGap: avgGap.toFixed(2),
    maxGap: maxGap.toFixed(1),
    worstFilm: worst ? worst.film : '',
    avgS: avgS.toFixed(2),
    avgR: avgR.toFixed(2),
    diff: (avgS - avgR).toFixed(2),
  };
}

/* ── RENDER STATS CARDS ── */
function renderStats(s) {
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">🎬</div>
      <div class="stat-val">${s.total}</div>
      <div class="stat-lbl">Films analysés</div>
      <div class="stat-sub">${s.withVotes} avec au moins 1 vote</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📈</div>
      <div class="stat-val">${s.infPct}%</div>
      <div class="stat-lbl">Notes gonflées</div>
      <div class="stat-sub">${s.infCount} films avec note affichée &gt; note réelle</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⚠️</div>
      <div class="stat-val">+${s.avgGap}★</div>
      <div class="stat-lbl">Écart moyen</div>
      <div class="stat-sub">Entre étoiles affichées et note brute</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-val">+${s.maxGap}★</div>
      <div class="stat-lbl">Écart maximum</div>
      <div class="stat-sub">${s.worstFilm.substring(0, 32)}${s.worstFilm.length > 32 ? '…' : ''}</div>
    </div>`;
}

/* ── DEMO BOX ── */
function starsHtml(n, full = '#ffd700', empty = 'rgba(255,255,255,.2)') {
  let h = '';
  for (let i = 1; i <= 5; i++) {
    const isHalf = i === Math.ceil(n) && n % 1 >= 0.5 && Math.floor(n) < i;
    const color  = i <= Math.floor(n) ? full : (isHalf ? full : empty);
    const style  = isHalf ? `color:${color};opacity:.6` : `color:${color}`;
    h += `<span style="${style}">★</span>`;
  }
  return h;
}

function renderDemo(data) {
  const examples = data
    .filter(d => d.votes > 500 && d.gap >= 0.1)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const rows = examples.map(d => `
    <div class="demo-row">
      <div>
        <div class="demo-name">${d.film.length > 22 ? d.film.substring(0, 22) + '…' : d.film}</div>
        <div class="demo-votes">${d.votes.toLocaleString('fr')} votes</div>
      </div>
      <div class="demo-ratings">
        <div class="star-row">
          <div class="stars">${starsHtml(d.rating)}</div>
          <div class="label" style="color:rgba(255,255,255,.4)">Réelle : ${d.rating}</div>
        </div>
        <div class="arrow">→</div>
        <div class="star-row">
          <div class="stars">${starsHtml(d.stars)}</div>
          <div class="label" style="color:#ffd700">Affichée : ${d.stars}</div>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('demo-box').innerHTML = `
    <div class="demo-winbar">
      <span class="win-dot wr"></span>
      <span class="win-dot wo"></span>
      <span class="win-dot wg"></span>
      <span class="demo-winlabel">fandango_ratings.csv</span>
    </div>
    <div class="demo-body">
      <div class="demo-sub">Note réelle → Note affichée</div>
      ${rows}
    </div>`;
}

/* ── INSIGHT BANNER ── */
function renderInsight(s) {
  document.getElementById('insight-banner').innerHTML = `
    <div class="insight">
      <div class="insight-num">${s.infPct}%</div>
      <div class="insight-text">
        <h4>des films ont une note Fandango artificiellement gonflée</h4>
        <p>En moyenne, la note affichée est <strong>+${s.diff} étoile(s)</strong> au-dessus de la note brute réelle.
           Moyenne affichée : ${s.avgS}★ — Moyenne réelle : ${s.avgR}★.</p>
      </div>
    </div>`;
}

/* ── CHARTS ── */
function renderCharts(data) {
  const v = data.filter(d => d.votes > 0);

  document.getElementById('charts-grid').innerHTML = `
    <div class="chart-card">
      <div class="chart-hd">
        <h3>Notes affichées vs notes réelles</h3>
        <p>Chaque point = 1 film. La diagonale verte = notation parfaitement équitable.
           Les points au-dessus → note gonflée.</p>
      </div>
      <div class="chart-box"><canvas id="c-scatter"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-hd">
        <h3>Distribution des écarts (STARS − RATING)</h3>
        <p>Un écart de 0 = honnête. Plus la barre est à droite, plus la note est gonflée.</p>
      </div>
      <div class="chart-box"><canvas id="c-gap"></canvas></div>
    </div>
    <div class="chart-card full">
      <div class="chart-hd">
        <h3>Répartition des notes : affichées vs réelles</h3>
        <p>Les notes affichées (rouge) s'accumulent sur 4.0–5.0 ; les notes réelles (bleu) sont mieux distribuées.</p>
      </div>
      <div class="chart-box short"><canvas id="c-dist"></canvas></div>
    </div>`;

  buildScatterChart(v);
  buildGapChart(v);
  buildDistChart(v);
}

function buildScatterChart(v) {
  new Chart(document.getElementById('c-scatter'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Notation équitable (y=x)',
          data: [{ x: 0, y: 0 }, { x: 5, y: 5 }],
          type: 'line',
          borderColor: 'rgba(34,197,94,.6)',
          borderDash: [6, 4], borderWidth: 2, pointRadius: 0, fill: false, order: 0,
        },
        {
          label: 'Films',
          data: v.map(d => ({ x: d.rating, y: d.stars, film: d.film, gap: d.gap, votes: d.votes })),
          backgroundColor: v.map(d =>
            d.gap === 0     ? 'rgba(34,197,94,.65)'  :
            d.gap <= 0.3    ? 'rgba(245,158,11,.65)' :
                              'rgba(227,24,55,.7)'
          ),
          pointRadius: 5, pointHoverRadius: 9, order: 1,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.raw.film ? [
              ctx.raw.film.substring(0, 45),
              `Réelle: ${ctx.raw.x}  |  Affichée: ${ctx.raw.y}  |  Écart: +${ctx.raw.gap}`,
              `${ctx.raw.votes.toLocaleString('fr')} votes`,
            ] : `(${ctx.raw.x}, ${ctx.raw.y})`,
          },
        },
      },
      scales: {
        x: { min: 0, max: 5.3, title: { display: true, text: 'Note réelle (RATING)' }, grid: { color: 'rgba(0,0,0,.05)' } },
        y: { min: 0, max: 5.3, title: { display: true, text: 'Note affichée (STARS)' }, grid: { color: 'rgba(0,0,0,.05)' } },
      },
    },
  });
}

function buildGapChart(v) {
  const buckets = {};
  v.forEach(d => { const k = d.gap.toFixed(1); buckets[k] = (buckets[k] || 0) + 1; });
  const keys = Object.keys(buckets).sort((a, b) => parseFloat(a) - parseFloat(b));

  new Chart(document.getElementById('c-gap'), {
    type: 'bar',
    data: {
      labels: keys.map(k => (parseFloat(k) >= 0 ? '+' : '') + parseFloat(k).toFixed(1)),
      datasets: [{
        label: 'Films',
        data: keys.map(k => buckets[k]),
        backgroundColor: keys.map(k => {
          const g = parseFloat(k);
          return g === 0   ? 'rgba(34,197,94,.7)'   :
                 g <= 0.3  ? 'rgba(245,158,11,.75)' :
                             'rgba(227,24,55,.8)';
        }),
        borderRadius: 6, borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `Écart : ${ctx[0].label} étoile(s)`,
            label: ctx => `${ctx.raw} films (${Math.round(ctx.raw / v.length * 100)}%)`,
          },
        },
      },
      scales: {
        x: { title: { display: true, text: 'Écart (STARS − RATING)' }, grid: { display: false } },
        y: { title: { display: true, text: 'Nombre de films' }, grid: { color: 'rgba(0,0,0,.05)' } },
      },
    },
  });
}

function buildDistChart(v) {
  const levels = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const snap   = n => Math.round(n * 2) / 2;

  new Chart(document.getElementById('c-dist'), {
    type: 'bar',
    data: {
      labels: levels.map(l => l.toFixed(1) + '★'),
      datasets: [
        {
          label: 'Notes affichées (STARS)',
          data: levels.map(l => v.filter(d => d.stars === l).length),
          backgroundColor: 'rgba(227,24,55,.75)', borderRadius: 4, borderWidth: 0,
        },
        {
          label: 'Notes réelles (RATING)',
          data: levels.map(l => v.filter(d => snap(d.rating) === l).length),
          backgroundColor: 'rgba(14,165,233,.75)', borderRadius: 4, borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label} : ${ctx.raw} films` } },
      },
      scales: {
        x: { title: { display: true, text: 'Note (arrondi au 0.5 le plus proche)' }, grid: { display: false } },
        y: { title: { display: true, text: 'Nombre de films' }, grid: { color: 'rgba(0,0,0,.05)' } },
      },
    },
  });
}

/* ── TABLE ── */
let ALL = [], FILT = [];
let sortK = 'votes', sortD = -1, page = 1, search = '', flt = 'all';
const PER = 15;

function gapClass(g) {
  return g === 0 ? 'g0' : g <= 0.2 ? 'g1' : g <= 0.4 ? 'g2' : 'g3';
}

function miniStars(n) {
  let s = '';
  for (let i = 1; i <= 5; i++)
    s += `<span style="color:${i <= n ? '#ffc107' : '#e2e8f0'}">★</span>`;
  return s;
}

function renderTable(data) {
  ALL  = data;
  FILT = [...data].sort((a, b) => b.votes - a.votes);

  document.getElementById('table-area').innerHTML = `
    <div class="table-controls">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Rechercher un film…" oninput="onSearch(this.value)" id="srch">
      </div>
      <select class="flt" onchange="onFlt(this.value)">
        <option value="all">Tous les films</option>
        <option value="voted">Avec votes seulement</option>
        <option value="0">Aucun écart (0.0)</option>
        <option value="low">Petit écart (0.1 – 0.3)</option>
        <option value="high">Grand écart (&gt; 0.3)</option>
      </select>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th onclick="srt('film')"   id="hfilm">Film</th>
            <th onclick="srt('stars')"  id="hstars">Affichée</th>
            <th onclick="srt('rating')" id="hrating">Réelle</th>
            <th onclick="srt('gap')"    id="hgap">Écart</th>
            <th onclick="srt('votes')"  id="hvotes" class="desc">Votes</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
    <div class="tbl-footer">
      <span id="tinfo"></span>
      <div class="pages" id="pgs"></div>
    </div>`;

  updateTable();
}

function updateTable() {
  FILT = ALL.filter(d => {
    const matchSearch = !search || d.film.toLowerCase().includes(search.toLowerCase());
    let matchFilter   = true;
    if      (flt === 'voted') matchFilter = d.votes > 0;
    else if (flt === '0')     matchFilter = d.gap === 0;
    else if (flt === 'low')   matchFilter = d.gap > 0 && d.gap <= 0.3;
    else if (flt === 'high')  matchFilter = d.gap > 0.3;
    return matchSearch && matchFilter;
  });

  FILT.sort((a, b) => {
    const av = typeof a[sortK] === 'string' ? a[sortK].toLowerCase() : a[sortK];
    const bv = typeof b[sortK] === 'string' ? b[sortK].toLowerCase() : b[sortK];
    return av < bv ? sortD : av > bv ? -sortD : 0;
  });

  const tot   = FILT.length;
  const totP  = Math.ceil(tot / PER) || 1;
  page        = Math.min(page, totP);
  const start = (page - 1) * PER;
  const slice = FILT.slice(start, start + PER);

  document.getElementById('tbody').innerHTML = slice.length
    ? slice.map(d => `
        <tr>
          <td><div class="film-cell" title="${d.film}">${d.film}</div></td>
          <td><div class="stars-cell">${d.stars.toFixed(1)} ${miniStars(d.stars)}</div></td>
          <td style="color:var(--muted)">${d.rating.toFixed(1)}</td>
          <td><span class="gap-pill ${gapClass(d.gap)}">${d.gap > 0 ? '+' : ''}${d.gap.toFixed(1)}</span></td>
          <td style="color:var(--muted)">${d.votes.toLocaleString('fr')}</td>
        </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted)">Aucun film trouvé</td></tr>`;

  document.getElementById('tinfo').textContent =
    `${start + 1}–${Math.min(start + PER, tot)} sur ${tot} films`;

  let html = '';
  const st = Math.max(1, page - 2);
  const en = Math.min(totP, st + 4);
  if (page > 1)   html += `<button class="pg" onclick="gp(${page - 1})">‹</button>`;
  for (let p = st; p <= en; p++)
    html += `<button class="pg${p === page ? ' on' : ''}" onclick="gp(${p})">${p}</button>`;
  if (page < totP) html += `<button class="pg" onclick="gp(${page + 1})">›</button>`;
  document.getElementById('pgs').innerHTML = html;
}

/* Handlers appelés depuis le HTML via oninput / onchange / onclick */
function onSearch(v) { search = v; page = 1; updateTable(); }
function onFlt(v)    { flt = v;    page = 1; updateTable(); }
function gp(p)       { page = p;   updateTable(); }

function srt(k) {
  sortD = sortK === k ? sortD * -1 : (k === 'film' ? 1 : -1);
  sortK = k;
  ['film', 'stars', 'rating', 'gap', 'votes'].forEach(key => {
    const el = document.getElementById('h' + key);
    if (el) el.className = '';
  });
  const el = document.getElementById('h' + k);
  if (el) el.className = sortD === 1 ? 'asc' : 'desc';
  page = 1;
  updateTable();
}

/* ── HERO CHART ── */
function renderHeroChart(data) {
  const canvas = document.getElementById('hero-chart');
  if (!canvas) return;
  const v = data.filter(d => d.votes > 0);

  new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Équitable (y=x)',
          data: [{ x: 0, y: 0 }, { x: 5, y: 5 }],
          type: 'line',
          borderColor: 'rgba(34,197,94,.4)',
          borderDash: [5, 4], borderWidth: 1.5,
          pointRadius: 0, fill: false, order: 0,
        },
        {
          label: 'Films',
          data: v.map(d => ({ x: d.rating, y: d.stars, film: d.film, gap: d.gap })),
          backgroundColor: v.map(d =>
            d.gap === 0  ? 'rgba(34,197,94,.7)'  :
            d.gap <= 0.3 ? 'rgba(245,158,11,.7)' :
                           'rgba(227,24,55,.8)'
          ),
          pointRadius: 4, pointHoverRadius: 8, order: 1,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,.92)',
          padding: 10,
          callbacks: {
            label: ctx => ctx.raw.film
              ? [`${ctx.raw.film.substring(0, 36)}`, `Réelle : ${ctx.raw.x} → Affichée : ${ctx.raw.y}`]
              : `(${ctx.raw.x}, ${ctx.raw.y})`,
          },
        },
      },
      scales: {
        x: {
          min: 0, max: 5.2,
          title: { display: true, text: 'Note réelle', color: 'rgba(255,255,255,.35)', font: { size: 10 } },
          ticks: { color: 'rgba(255,255,255,.35)', font: { size: 9 }, stepSize: 1 },
          grid:  { color: 'rgba(255,255,255,.06)' },
          border:{ color: 'rgba(255,255,255,.12)' },
        },
        y: {
          min: 0, max: 5.2,
          title: { display: true, text: 'Note affichée', color: 'rgba(255,255,255,.35)', font: { size: 10 } },
          ticks: { color: 'rgba(255,255,255,.35)', font: { size: 9 }, stepSize: 1 },
          grid:  { color: 'rgba(255,255,255,.06)' },
          border:{ color: 'rgba(255,255,255,.12)' },
        },
      },
    },
  });
}

/* ── UI BEHAVIORS ── */
function initUI() {
  // Header scroll effect
  window.addEventListener('scroll', () => {
    document.querySelector('header').classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Scroll-reveal
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  ['.stats-wrap', '.story-bg', '#charts', '.table-bg', 'footer'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.classList.add('reveal'); revealObs.observe(el); }
  });

  // Scrollspy nav
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const spyObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`nav a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[id]').forEach(el => spyObs.observe(el));
}

/* ── INIT ── */
(async () => {
  try {
    const data = await loadData();
    const s    = computeStats(data);
    initUI();
    renderHeroChart(data);
    renderStats(s);
    renderDemo(data);
    renderInsight(s);
    renderCharts(data);
    renderTable(data);
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML('beforeend', `
      <div style="position:fixed;bottom:20px;right:20px;background:#e31837;color:#fff;
                  padding:1rem 1.25rem;border-radius:10px;max-width:320px;
                  font-size:.875rem;box-shadow:0 4px 20px rgba(0,0,0,.3)">
        ⚠️ Erreur : ${e.message}<br>
        <small>Vérifiez que fandango_data.csv est dans le même dossier.</small>
      </div>`);
  }
})();
