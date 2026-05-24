/* ═══════════════════════════════════════════
   DATA — loaded from locations.json
═══════════════════════════════════════════ */
let LOCATIONS = [];

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
const state = {
  filter: 'all',
  visited: new Set(),
  pinOrder: [], // IDs in the order they were pinned
  userLat: null,
  userLng: null,
};

/* ═══════════════════════════════════════════
   GEO MATH
═══════════════════════════════════════════ */
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2))
    - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function compassDir(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function fmtDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/* ═══════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════ */
function save() {
  localStorage.setItem('zrh-visited', JSON.stringify([...state.visited]));
  localStorage.setItem('zrh-pinned', JSON.stringify(state.pinOrder));
}

function load() {
  try {
    const v = JSON.parse(localStorage.getItem('zrh-visited') || '[]');
    state.visited = new Set(v);
  } catch { state.visited = new Set(); }

  try {
    const p = JSON.parse(localStorage.getItem('zrh-pinned') || '[]');
    state.pinOrder = Array.isArray(p) ? p : [];
  } catch { state.pinOrder = []; }

  const theme = localStorage.getItem('zrh-theme');
  if (theme) document.documentElement.dataset.theme = theme;
}

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
const ICONS = {
  sun: `<path d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
  moon: `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
};

function setThemeIcon() {
  const isDark = document.documentElement.dataset.theme === 'dark'
    || (!document.documentElement.dataset.theme
        && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const svg = document.querySelector('#themeBtn svg');
  svg.innerHTML = isDark ? ICONS.sun : ICONS.moon;
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('zrh-theme', next);
  setThemeIcon();
}

/* ═══════════════════════════════════════════
   GEOLOCATION
═══════════════════════════════════════════ */
let geoWatchId = null;
let lastGeoUpdate = 0;
const GEO_THROTTLE_MS = 5000;

function startGeo() {
  if (!navigator.geolocation) return;

  const banner = document.getElementById('locBanner');

  const tryWatch = () => {
    if (geoWatchId !== null) return;
    geoWatchId = navigator.geolocation.watchPosition(
      pos => {
        const now = Date.now();
        if (now - lastGeoUpdate < GEO_THROTTLE_MS) return;
        lastGeoUpdate = now;
        state.userLat = pos.coords.latitude;
        state.userLng = pos.coords.longitude;
        banner.classList.add('hidden');
        refreshDistances();
      },
      err => {
        // code 1 = PERMISSION_DENIED, code 2 = unavailable (temporary), code 3 = timeout (watchPosition self-recovers)
        if (err.code === 1) banner.classList.remove('hidden');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );
  };

  // Start immediately — already granted = silent success, denied = banner shown via error handler
  tryWatch();

  document.getElementById('locBtn').addEventListener('click', () => {
    banner.classList.add('hidden');
    if (geoWatchId !== null) {
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = null;
    }
    tryWatch();
  });
}


/* ═══════════════════════════════════════════
   RENDER
═══════════════════════════════════════════ */
const WX_SVG = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="3.5" fill="currentColor"/><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M3.64 3.64l1.42 1.42M14.94 14.94l1.42 1.42M14.94 5.06l-1.42 1.42M4.36 15.36l-1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const COMPASS_SVG = `
<svg class="compass-svg" viewBox="0 0 42 42" aria-hidden="true">
  <circle cx="21" cy="21" r="19" class="c-ring"/>
  <g class="c-needle">
    <polygon points="21,4 24.5,19 21,17 17.5,19" class="c-north"/>
    <polygon points="21,38 24.5,23 21,25 17.5,23" class="c-south"/>
    <circle cx="21" cy="21" r="3" class="c-dot"/>
  </g>
</svg>`;

function getFiltered() {
  const isDone   = id => state.visited.has(id);
  const isPinned = id => state.pinOrder.includes(id);
  const dist     = l  => state.userLat == null ? 0
    : haversine(state.userLat, state.userLng, l.lat, l.lng);
  const byDist   = (a, b) => dist(a) - dist(b);

  if (state.filter === 'done') {
    return LOCATIONS.filter(l => isDone(l.id)).sort(byDist);
  }

  const pool = state.filter === 'todo'
    ? LOCATIONS.filter(l => !isDone(l.id))
    : LOCATIONS;

  // 1. Pinned + not done — in the order they were pinned
  const pinnedTodo = state.pinOrder
    .map(id => pool.find(l => l.id === id && !isDone(l.id)))
    .filter(Boolean);

  // 2. Unpinned + not done — by distance
  const unpinnedTodo = pool
    .filter(l => !isDone(l.id) && !isPinned(l.id))
    .sort(byDist);

  if (state.filter === 'todo') return [...pinnedTodo, ...unpinnedTodo];

  // 3. Done — by distance, always at the bottom
  const doneItems = LOCATIONS.filter(l => isDone(l.id)).sort(byDist);

  return [...pinnedTodo, ...unpinnedTodo, ...doneItems];
}

function makeCard(loc) {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.id = loc.id;
  el.dataset.visited = state.visited.has(loc.id);
  el.dataset.pinned = state.pinOrder.includes(loc.id);
  el.innerHTML = `
    <div class="card-body">
      <div class="card-top">
        <h2 class="card-name">${loc.name}</h2>
        <button class="pin-btn" aria-label="Pin to top" title="Pin">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3h12a1 1 0 011 1v16l-7-3.5L5 20V4a1 1 0 011-1z" class="pin-path" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="desc-btn" aria-label="Show description" title="Description">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4h12M2 8h12M2 12h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="visit-btn" aria-label="Toggle visited">
          <svg class="visit-svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10.5" class="v-ring"/>
            <polyline points="7.5,12 10.5,15 16.5,9" class="v-check"/>
          </svg>
        </button>
      </div>
      <p class="card-desc">${loc.desc}</p>
      <div class="card-footer">
        <div class="compass-row">
          ${COMPASS_SVG}
          <div class="geo-info">
            <span class="geo-dist">—</span>
            <span class="geo-dir"></span>
          </div>
        </div>
        <div class="card-actions">
          ${loc.weatherSensitive ? `<span class="wx-icon" title="Best in good weather">${WX_SVG}</span>` : ''}
          <button class="nav-btn" aria-label="Open in Google Maps" title="Navigate">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
  return el;
}

function applyGeo(card, loc) {
  const needle = card.querySelector('.c-needle');
  const distEl = card.querySelector('.geo-dist');
  const dirEl  = card.querySelector('.geo-dir');

  if (state.userLat == null) {
    distEl.textContent = '—';
    dirEl.textContent = '';
    needle.style.transform = '';
    return;
  }

  const dist = haversine(state.userLat, state.userLng, loc.lat, loc.lng);
  const bear = bearing(state.userLat, state.userLng, loc.lat, loc.lng);

  needle.style.transform = `rotate(${bear}deg)`;
  distEl.textContent = fmtDist(dist);
  dirEl.textContent  = compassDir(bear);
}

function render() {
  const list     = document.getElementById('list');
  const filtered = getFiltered();

  document.getElementById('progressText').textContent =
    `${state.visited.size} of ${LOCATIONS.length} visited`;

  // Build card map for reuse
  const existing = new Map();
  list.querySelectorAll('.card[data-id]').forEach(el =>
    existing.set(Number(el.dataset.id), el)
  );

  const frag = document.createDocumentFragment();

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = state.filter === 'done'
      ? 'No places visited yet — get exploring!'
      : 'All places visited. Well done!';
    frag.appendChild(empty);
  } else {
    filtered.forEach(loc => {
      let card = existing.get(loc.id);
      if (!card) card = makeCard(loc);
      card.dataset.visited = state.visited.has(loc.id);
      card.dataset.pinned  = state.pinOrder.includes(loc.id);
      applyGeo(card, loc);
      frag.appendChild(card);
    });
  }

  list.replaceChildren(frag);
}

function refreshDistances() {
  const filtered = getFiltered();
  const list = document.getElementById('list');

  // Always update needle + distance text in place (no DOM reorder, no blink)
  list.querySelectorAll('.card[data-id]').forEach(card => {
    const id  = Number(card.dataset.id);
    const loc = LOCATIONS.find(l => l.id === id);
    if (loc) applyGeo(card, loc);
  });

  // Only re-order cards if the sort order actually changed
  if (state.userLat != null) reorderIfChanged(filtered, list);
}

function reorderIfChanged(filtered, list) {
  const currentOrder = [...list.querySelectorAll('.card[data-id]')]
    .map(c => Number(c.dataset.id)).join(',');
  const newOrder = filtered.map(l => l.id).join(',');
  if (currentOrder !== newOrder) {
    filtered.forEach(loc => {
      const card = list.querySelector(`.card[data-id="${loc.id}"]`);
      if (card) list.appendChild(card);
    });
  }
}

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
function openMaps(loc) {
  const url = `https://maps.google.com/?daddr=${loc.lat},${loc.lng}`;
  // Anchor click works in iOS standalone mode where window.open() doesn't
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.click();
}

/* ═══════════════════════════════════════════
   EVENTS
═══════════════════════════════════════════ */
function setupEvents() {
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);

  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      state.filter = t.dataset.filter;
      render();
    })
  );

  document.getElementById('list').addEventListener('click', e => {
    const descBtn = e.target.closest('.desc-btn');
    if (descBtn) {
      const card = descBtn.closest('.card');
      card.dataset.expanded = card.dataset.expanded === 'true' ? 'false' : 'true';
      return;
    }

    const pinBtn = e.target.closest('.pin-btn');
    if (pinBtn) {
      const card = pinBtn.closest('.card');
      const id   = Number(card.dataset.id);
      state.pinOrder = state.pinOrder.filter(x => x !== id);
      if (card.dataset.pinned !== 'true') state.pinOrder.push(id);
      save();
      card.dataset.pinned = state.pinOrder.includes(id);
      reorderIfChanged(getFiltered(), document.getElementById('list'));
      return;
    }

    const visitBtn = e.target.closest('.visit-btn');
    if (visitBtn) {
      const card = visitBtn.closest('.card');
      const id   = Number(card.dataset.id);
      if (state.visited.has(id)) state.visited.delete(id);
      else state.visited.add(id);
      save();
      card.dataset.visited = state.visited.has(id);
      document.getElementById('progressText').textContent =
        `${state.visited.size} of ${LOCATIONS.length} visited`;
      reorderIfChanged(getFiltered(), document.getElementById('list'));
      return;
    }

    const navBtn = e.target.closest('.nav-btn');
    if (navBtn) {
      const card = navBtn.closest('.card');
      const id   = Number(card.dataset.id);
      const loc  = LOCATIONS.find(l => l.id === id);
      if (loc) openMaps(loc);
    }
  });
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
async function init() {
  LOCATIONS = await fetch('./locations.json').then(r => r.json());
  load();
  setThemeIcon();
  setupEvents();
  startGeo();
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);