/* Stratus Cloud Phones — front-end app with a working phone OS (no build, no deps) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clockStr(d) { d = d || new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function randId() { return Math.random().toString(36).slice(2, 8); }

  /* ============================ DATA ============================ */
  var DEVICES = [
    { id: 'nova-lite', name: 'Nova Lite', tier: 'lite', chip: '4 vCPU · 4 GB RAM', storage: '64 GB', display: '720p stream', use: 'Automation & alt accounts', hourly: 0.04, monthly: 19, grad: ['#34d399', '#0ea5e9'] },
    { id: 'nova-a2', name: 'Nova A2', tier: 'lite', chip: '4 vCPU · 6 GB RAM', storage: '128 GB', display: '1080p stream', use: 'Social, messaging, farming', hourly: 0.06, monthly: 29, grad: ['#22d3ee', '#6366f1'] },
    { id: 'pixel-9-pro', name: 'Pixel 9 Pro', tier: 'pro', chip: '8 vCPU · 8 GB RAM', storage: '128 GB', display: '1080p60 stream', use: 'Most popular · gaming + testing', hourly: 0.09, monthly: 45, grad: ['#6366f1', '#a855f7'] },
    { id: 'pixel-9-ultra', name: 'Pixel 9 Ultra', tier: 'pro', chip: '8 vCPU · 12 GB RAM', storage: '256 GB', display: '1440p60 stream', use: 'Heavy games & CI device farm', hourly: 0.14, monthly: 69, grad: ['#8b5cf6', '#ec4899'] },
    { id: 'titan-x1', name: 'Titan X1', tier: 'ultra', chip: '12 vCPU · 16 GB RAM', storage: '512 GB', display: '1440p120 stream', use: 'Esports-grade · lowest latency', hourly: 0.22, monthly: 109, grad: ['#f472b6', '#f59e0b'] },
    { id: 'titan-x2-max', name: 'Titan X2 Max', tier: 'ultra', chip: '16 vCPU · 24 GB RAM', storage: '1 TB', display: '4K stream · root ready', use: 'Studios · bots at scale', hourly: 0.35, monthly: 175, grad: ['#f59e0b', '#ef4444'] }
  ];
  var REGIONS = ['Frankfurt', 'London', 'Virginia', 'Oregon', 'Singapore', 'Tokyo', 'Mumbai', 'São Paulo'];
  var PLANS = [
    { id: 'lite', name: 'Lite Fleet', hourly: 0.04, monthly: 19, desc: 'Up to 3 phones · 720p · community support', cta: 'Start Lite' },
    { id: 'pro', name: 'Pro Gamer', hourly: 0.09, monthly: 45, desc: 'Up to 10 phones · 1080p60 · ADB + API · priority regions', cta: 'Start Pro', hot: true },
    { id: 'studio', name: 'Studio Scale', hourly: 0.35, monthly: 175, desc: '50+ phones · 4K · multi-control · SSO · dedicated support', cta: 'Talk to us' }
  ];
  var CONTACTS = [
    { id: 'mom', name: 'Mom', num: '+1 202 555 0141', c: ['#f472b6', '#8b5cf6'] },
    { id: 'sam', name: 'Sam Rivera', num: '+1 202 555 0188', c: ['#34d399', '#0ea5e9'] },
    { id: 'devops', name: 'DevOps Bot', num: '+1 202 555 0007', c: ['#fbbf24', '#f97316'] },
    { id: 'qa', name: 'QA Squad', num: '+1 202 555 0199', c: ['#22d3ee', '#6366f1'] }
  ];
  var APP_META = [
    { id: 'browser', name: 'Browser', icon: '🌐', c: ['#38bdf8', '#6366f1'], dock: true },
    { id: 'dialer', name: 'Phone', icon: '📞', c: ['#34d399', '#0ea5e9'], dock: true },
    { id: 'messages', name: 'Messages', icon: '💬', c: ['#4ade80', '#0284c7'], dock: true },
    { id: 'camera', name: 'Camera', icon: '📷', c: ['#94a3b8', '#334155'], dock: true },
    { id: 'gallery', name: 'Gallery', icon: '🖼️', c: ['#f472b6', '#8b5cf6'] },
    { id: 'notes', name: 'Notes', icon: '📝', c: ['#fde047', '#f97316'] },
    { id: 'calculator', name: 'Calculator', icon: '🧮', c: ['#64748b', '#0f172a'] },
    { id: 'clock', name: 'Clock', icon: '⏰', c: ['#a78bfa', '#6366f1'] },
    { id: 'music', name: 'Music', icon: '🎵', c: ['#ec4899', '#8b5cf6'] },
    { id: 'maps', name: 'Maps', icon: '🗺️', c: ['#4ade80', '#0284c7'] },
    { id: 'calendar', name: 'Calendar', icon: '📅', c: ['#f87171', '#b91c1c'] },
    { id: 'weather', name: 'Weather', icon: '⛅', c: ['#38bdf8', '#1d4ed8'] },
    { id: 'files', name: 'Files', icon: '📁', c: ['#fbbf24', '#f59e0b'] },
    { id: 'store', name: 'Store', icon: '🛍️', c: ['#a3e635', '#16a34a'] },
    { id: 'settings', name: 'Settings', icon: '⚙️', c: ['#94a3b8', '#475569'] },
    { id: 'torch', name: 'Flashlight', icon: '🔦', c: ['#fde047', '#ca8a04'] },
    { id: 'compass', name: 'Compass', icon: '🧭', c: ['#22d3ee', '#0f766e'] }
  ];
  var META = {}; APP_META.forEach(function (a) { META[a.id] = a; });
  var WALLS = [
    'linear-gradient(165deg,#1e1b4b,#312e81 40%,#0e7490 100%)',
    'linear-gradient(165deg,#4c1d95,#be185d 55%,#f59e0b 110%)',
    'linear-gradient(165deg,#052e16,#047857 55%,#22d3ee 120%)',
    'linear-gradient(165deg,#0f172a,#334155 60%,#64748b 120%)'
  ];

  /* ============================ FLEET STATE ============================ */
  var LS_KEY = 'stratus-fleet-v2';
  var fleet = load() || seed();
  var billing = 'hourly', activeTier = 'all', searchQ = '', launchDeviceId = 'pixel-9-pro', metricsId = null, emuId = null;
  var OS = null;

  function load() { try { var v = JSON.parse(localStorage.getItem(LS_KEY)); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(fleet)); } catch (e) {} }
  function seed() {
    return [{ id: 'phone-' + randId(), name: 'farm-01', deviceId: 'pixel-9-pro', region: 'Frankfurt', plan: 'hourly', image: 'Android 15 · GMS', status: 'running', createdAt: Date.now() - 2520000, uptimeSec: 2520, demo: false }];
  }
  function device(id) { return DEVICES.filter(function (d) { return d.id === id; })[0] || DEVICES[2]; }
  function inst(id) { return fleet.filter(function (p) { return p.id === id; })[0] || null; }
  function money(h) { return '$' + h.toFixed(2); }
  function phoneState(p) {
    if (!p.state) p.state = {
      installed: ['browser', 'dialer', 'messages', 'camera', 'gallery', 'notes', 'calculator', 'clock', 'music', 'maps', 'calendar', 'weather', 'files', 'store', 'settings'],
      wall: 0, brightness: 100, volume: 60, wifi: true, notifyOn: true, locked: false,
      notes: [{ id: randId(), title: 'Welcome back', body: 'This phone is yours. Notes, photos, calls and messages all persist on the instance.', t: Date.now() }],
      gallery: [], threads: {}, calllog: [], alarms: [], events: {}, bookmarks: ['https://en.wikipedia.org/', 'https://news.ycombinator.com'], browser: null, notifs: []
    };
    var s = p.state;
    if (!s.books) s.books = [];
    return s;
  }
  function seedThreads(s) {
    if (Object.keys(s.threads).length) return;
    s.threads.mom = [{ me: false, text: 'Hi! Is your cloud phone set up yet?', t: Date.now() - 3600000 }];
    s.threads.devops = [{ me: false, text: 'Deploy #482 finished in 3m 12s ✅', t: Date.now() - 1800000 }];
    s.threads.qa = [{ me: true, text: 'Build is live on the Pixel 9 Pro.', t: Date.now() - 900000 }];
  }

  /* ============================ TOASTS / LOGS ============================ */
  function toast(msg) {
    var box = $('#toasts'); if (!box) return; var t = el('div', 'toast', esc(msg)); box.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 3200);
  }
  function emuLog(msg) {
    var ul = $('#emuLog'); if (!ul) return;
    var li = el('li', null, esc(new Date().toLocaleTimeString() + ' — ' + msg)); ul.prepend(li);
    while (ul.children.length > 12) ul.lastChild.remove();
  }
  function metricLog(msg) {
    var ul = $('#metricLog'); if (!ul) return;
    var li = el('li', null, esc(new Date().toLocaleTimeString() + ' — ' + msg)); ul.prepend(li);
    while (ul.children.length > 8) ul.lastChild.remove();
  }

  /* ============================ CLOCKS ============================ */
  function tickClocks() {
    var s = clockStr();
    var h = document.getElementById('heroClock'); if (h) h.textContent = s;
    var f = $('#footClock'); if (f) f.textContent = 'Local time ' + new Date().toLocaleTimeString();
  }

  /* ============================ HERO PHONE ============================ */
  function heroApp(a) {
    var b = el('button', 'p-app', '<i style="--c1:' + a.c[0] + ';--c2:' + a.c[1] + '">' + a.icon + '</i><span>' + a.name + '</span>');
    b.addEventListener('click', function () { openEmu(ensureDemo(), a.id); });
    return b;
  }
  function renderHeroPhone() {
    var g = $('#heroGrid'), d = $('#heroDock'); if (!g) return; g.innerHTML = ''; d.innerHTML = '';
    APP_META.filter(function (a) { return !a.dock && a.id !== 'store' && a.id !== 'settings'; }).slice(0, 8).forEach(function (a) { g.appendChild(heroApp(a)); });
    APP_META.filter(function (a) { return a.dock; }).forEach(function (a) { d.appendChild(heroApp(a)); });
  }

  /* ============================ CATALOG / PRICING ============================ */
  function renderCatalog() {
    var grid = $('#catalogGrid'); if (!grid) return; grid.innerHTML = '';
    var list = DEVICES.filter(function (d) {
      var q = searchQ.trim().toLowerCase();
      return (activeTier === 'all' || d.tier === activeTier) && (!q || (d.name + ' ' + d.chip + ' ' + d.use + ' ' + d.tier).toLowerCase().indexOf(q) !== -1);
    });
    if (!list.length) { grid.innerHTML = '<div class="empty">No devices match. Try another search or tier.</div>'; return; }
    list.forEach(function (d) {
      var card = el('article', 'device');
      card.innerHTML = '<div class="device-top"><span class="tier ' + d.tier + '">' + d.tier + '</span><span class="price">' + money(d.hourly) + ' <small>/hr</small></span></div>' +
        '<h3>' + esc(d.name) + '</h3><div class="use">' + esc(d.use) + '</div>' +
        '<ul class="specs"><li>⚡ <b>' + esc(d.chip) + '</b></li><li>💾 <b>' + esc(d.storage) + '</b> private storage</li><li>📡 <b>' + esc(d.display) + '</b></li></ul>' +
        '<div class="device-foot"><span class="price">' + money(d.hourly) + ' <small>/hr · $' + d.monthly + '/mo</small></span></div>';
      var row = el('div', 'inst-actions');
      var b1 = el('button', 'btn btn-primary btn-sm', 'Launch'); b1.addEventListener('click', function () { openLaunch(d.id); });
      var b2 = el('button', 'btn btn-ghost btn-sm', 'Demo'); b2.addEventListener('click', function () {
        var rp = $('#regionPick');
        openEmu({ id: 'demo-' + d.id, name: 'demo · ' + d.name, deviceId: d.id, region: rp && rp.value !== 'auto' ? rp.value : 'Frankfurt', plan: 'hourly', image: 'Android 15 · GMS', status: 'running', createdAt: Date.now(), uptimeSec: 0, demo: true }, null);
      });
      row.appendChild(b1); row.appendChild(b2); card.appendChild(row); grid.appendChild(card);
    });
  }
  function renderPricing() {
    var grid = $('#pricingGrid'); if (!grid) return; grid.innerHTML = '';
    PLANS.forEach(function (p) {
      var c = el('div', 'price-card' + (p.hot ? ' hot' : ''));
      var val = billing === 'hourly' ? money(p.hourly) + ' <small>/hr</small>' : '$' + Math.round(p.monthly * 0.7) + ' <small>/mo</small>';
      c.innerHTML = (p.hot ? '<span class="flag">MOST POPULAR</span>' : '') + '<h3>' + esc(p.name) + '</h3><div class="big">' + val + '</div><p class="sub">' + esc(p.desc) + '</p>' +
        '<ul class="feat"><li>Unlimited streaming</li><li>24/7 always-on uptime</li><li>ADB + REST API access</li><li>Free snapshots (50 GB)</li></ul>';
      var b = el('button', 'btn ' + (p.hot ? 'btn-primary' : 'btn-ghost'), p.cta);
      b.addEventListener('click', function () { openLaunch(p.id === 'studio' ? 'titan-x2-max' : (p.id === 'pro' ? 'pixel-9-pro' : 'nova-lite')); });
      c.appendChild(b); grid.appendChild(c);
    });
  }

  /* ============================ FLEET DASHBOARD ============================ */
  function fmtUptime(sec) { sec = Math.floor(sec); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return (h ? h + 'h ' : '') + (m ? m + 'm ' : '') + s + 's'; }
  function renderFleet() {
    var list = $('#fleetList'); if (!list) return; list.innerHTML = '';
    if (!fleet.length) { list.innerHTML = '<div class="fleet-empty"><h3>No phones yet</h3><p>Launch your first cloud phone — the first 2 hours are free.</p></div>'; return; }
    fleet.forEach(function (p) {
      var d = device(p.deviceId); var elc = el('div', 'instance');
      var age = Math.max(1, Math.round((Date.now() - p.createdAt) / 1000));
      var pct = p.status === 'running' ? Math.min(99, 8 + (age % 80)) : (p.status === 'provisioning' ? 45 : 0);
      var apps = phoneState(p).installed.length;
      elc.innerHTML = '<div class="inst-head"><h3>' + esc(p.name) + '</h3><span class="status ' + p.status + '">' + p.status + '</span><span class="tier ' + d.tier + '">' + esc(d.name) + '</span></div>' +
        '<p class="inst-meta"><b>' + esc(p.region) + '</b> · ' + esc(p.image) + ' · ' + (p.plan === 'monthly' ? 'monthly' : money(d.hourly) + '/hr') + ' · uptime <b>' + fmtUptime(p.uptimeSec) + '</b> · ' + apps + ' apps</p>' +
        '<div class="inst-bar"><i style="width:' + pct + '%"></i></div>';
      var row = el('div', 'inst-actions');
      function btn(label, cls, fn, dis) { var b = el('button', 'btn ' + cls + ' btn-sm', label); if (dis) b.disabled = true; b.addEventListener('click', fn); row.appendChild(b); }
      if (p.status === 'running') {
        btn('Open phone', 'btn-primary', function () { openEmu(p, null); });
        btn('Metrics', 'btn-ghost', function () { metricsId = p.id; renderMetricsLabel(); metricLog('Attached to ' + p.name); });
        btn('Reboot', 'btn-ghost', function () { reboot(p.id); });
        btn('Stop', 'btn-ghost', function () { setStatus(p.id, 'stopped'); });
      } else if (p.status === 'provisioning') {
        btn('Booting…', 'btn-ghost', function () {}, true);
      } else {
        btn('Start', 'btn-primary', function () { reboot(p.id); });
        btn('Open', 'btn-ghost', function () { openEmu(p, null); });
      }
      btn('Terminate', 'btn-danger', function () { terminate(p.id); });
      elc.appendChild(row); list.appendChild(elc);
    });
  }
  function setStatus(id, st) { var p = inst(id); if (!p) return; p.status = st; save(); renderFleet(); metricLog(p.name + ' → ' + st); if (OS && OS.phone.id === id) osInvalidate(); }
  function reboot(id) {
    var p = inst(id); if (!p) return; setStatus(id, 'provisioning'); toast('Rebooting ' + p.name + '…');
    setTimeout(function () { p.uptimeSec = 0; p.createdAt = Date.now(); setStatus(id, 'running'); toast(p.name + ' is back online'); }, 2600);
  }
  function terminate(id) {
    var p = inst(id); if (!p) return; if (!confirm('Terminate ' + p.name + '? Its snapshot is kept for 30 days.')) return;
    fleet = fleet.filter(function (x) { return x.id !== id; });
    if (metricsId === id) metricsId = fleet.length ? fleet[0].id : null;
    save(); renderFleet(); renderMetricsLabel(); toast(p.name + ' terminated');
  }
  function renderMetricsLabel() { var p = metricsId ? inst(metricsId) : fleet[0]; $('#metricsTarget').textContent = p ? p.name : 'no phones'; if (p) metricsId = p.id; }

  /* ============================ LAUNCH MODAL ============================ */
  function openLaunch(devId) { if (devId) launchDeviceId = devId; renderLaunchDevices(); updateLaunchPrice(); openOverlay('#launchOverlay'); }
  function renderLaunchDevices() {
    var box = $('#launchDevices'); if (!box) return; box.innerHTML = '';
    DEVICES.forEach(function (d) {
      var sel = el('div', 'pick' + (d.id === launchDeviceId ? ' sel' : ''), '<div><b>' + esc(d.name) + ' · ' + esc(d.chip) + '</b><span>' + esc(d.use) + '</span></div><strong>' + money(d.hourly) + '/h</strong>');
      sel.addEventListener('click', function () { launchDeviceId = d.id; renderLaunchDevices(); updateLaunchPrice(); });
      box.appendChild(sel);
    });
  }
  function updateLaunchPrice() { var d = device(launchDeviceId), plan = $('#launchPlan').value; $('#launchPrice').textContent = plan === 'monthly' ? '$' + Math.round(d.monthly * 0.7) + '/mo' : money(d.hourly) + '/hr'; }
  function confirmLaunch() {
    var d = device(launchDeviceId), region = $('#launchRegion').value, plan = $('#launchPlan').value, image = $('#launchImage').value;
    var name = ($('#launchName').value || '').trim() || (d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + randId().slice(0, 2));
    var p = { id: 'phone-' + randId(), name: name, deviceId: d.id, region: region, plan: plan, image: image, status: 'provisioning', createdAt: Date.now(), uptimeSec: 0 };
    fleet.unshift(p); metricsId = p.id; save(); renderFleet(); renderMetricsLabel(); closeOverlays();
    toast('Provisioning ' + name + ' (' + d.name + ' · ' + region + ')…'); metricLog('Provisioning ' + name + '…');
    setTimeout(function () { p.status = 'running'; metricsId = p.id; save(); renderFleet(); toast(name + ' is online'); metricLog(name + ' online · 34ms RTT'); openEmu(p, null); }, 2800);
  }

  /* ============================ OVERLAYS ============================ */
  function openOverlay(sel) { var o = $(sel); if (o) { o.classList.add('open'); o.setAttribute('aria-hidden', 'false'); } }
  function closeOverlays() { $$('.overlay').forEach(function (o) { o.classList.remove('open'); o.setAttribute('aria-hidden', 'true'); }); if (OS) { destroyOS(); } }

  /* ============================ PHONE OS ============================ */
  function ensureDemo() {
    for (var i = 0; i < fleet.length; i++) if (fleet[i].status === 'running') return fleet[i];
    return { id: 'demo-live', name: 'demo · Pixel 9 Pro', deviceId: 'pixel-9-pro', region: 'Frankfurt', plan: 'hourly', image: 'Android 15 · GMS', status: 'running', createdAt: Date.now(), uptimeSec: 0, demo: true };
  }
  function openEmu(p, startApp) {
    emuId = p.demo ? null : p.id;
    if (!p.demo && !inst(p.id)) { toast('Phone no longer exists'); return; }
    var target = p.demo ? p : inst(p.id), d = device(target.deviceId);
    $('#emuTitle').textContent = target.name;
    $('#emuSub').textContent = d.name + ' · ' + target.region + ' · ' + (target.plan === 'monthly' ? 'monthly' : 'hourly');
    openOverlay('#emuOverlay');
    buildOS(target);
    if (startApp) openApp(startApp);
    emuLog('Connected to ' + target.name + ' (' + target.region + ', 34ms)');
  }
  function destroyOS() {
    if (!OS) return;
    OS.stack.forEach(function (f) { if (f.cleanup) try { f.cleanup(); } catch (e) {} });
    OS.ivs.forEach(clearInterval);
    if (OS.music && OS.music.stop) try { OS.music.stop(); } catch (e) {}
    if (OS.camStream) try { OS.camStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    if (OS.renderTimer) clearTimeout(OS.renderTimer);
    OS = null;
  }
  function osInvalidate() { if (!OS) return; if (OS.booted) return; if (OS.phone.status === 'running') { OS.booted = true; renderHome(); } }

  function buildOS(phone) {
    destroyOS();
    var screen = $('#emuScreen'); screen.innerHTML = '';
    var st = phoneState(phone); seedThreads(st);
    OS = { phone: phone, st: st, stack: [], recents: [], ivs: [], camStream: null, booted: phone.status === 'running', shadeOpen: false, drawerOpen: false };
    OS.screen = screen;

    OS.status = el('div', 'os-status'); OS.timeEl = el('div', 'os-time'); OS.indEl = el('div', 'os-ind');
    OS.status.appendChild(OS.timeEl); OS.status.appendChild(OS.indEl);
    OS.status.addEventListener('click', toggleShade);
    OS.body = el('div', 'os-body');
    OS.nav = el('div', 'os-nav', '<button data-n="back" title="Back">◁</button><button data-n="home" title="Home">◯</button><button data-n="recents" title="Recent">▢</button>');
    OS.nav.querySelector('[data-n="back"]').addEventListener('click', osBack);
    OS.nav.querySelector('[data-n="home"]').addEventListener('click', osHome);
    OS.nav.querySelector('[data-n="recents"]').addEventListener('click', toggleRecents);
    screen.appendChild(OS.status); screen.appendChild(OS.body); screen.appendChild(OS.nav);

    OS.drawer = el('div', 'os-drawer'); screen.appendChild(OS.drawer);
    OS.shade = el('div', 'os-shade'); screen.appendChild(OS.shade);
    OS.lock = el('div', 'os-lock'); screen.appendChild(OS.lock);

    applyBrightness();
    if (st.locked) renderLock(); else { renderHome(); }
    OS.ivs.push(setInterval(osTick, 1000));
    OS.ivs.push(setInterval(function () { if (OS) laneTick(); }, 5000));
    osTick();
  }

  function applyBrightness() { if (OS) OS.screen.style.filter = 'brightness(' + clamp(OS.st.brightness || 100, 20, 100) + '%)'; }
  function applyWall() { if (OS) OS.screen.style.background = WALLS[OS.st.wall || 0]; }

  function osTick() {
    if (!OS) return;
    OS.timeEl.textContent = clockStr();
    var st = OS.st, ind = OS.indEl;
    ind.textContent = (st.wifi ? '📶' : '📵') + ' 5G  ' + (OS.phone.status === 'running' ? '🔋100%' : '🔌—');
    if (OS.lockTime) OS.lockTime.textContent = clockStr();
    checkAlarms();
    osInvalidate();
  }
  function laneTick() { if (OS) OS.phone.uptimeSec += 5; }

  function api() {
    return {
      go: openApp, back: osBack, home: osHome, toast: osToast, notify: notify, save: save,
      setDirty: function () { if (OS && OS.stack.length) renderApp(); },
      invalidate: renderHome
    };
  }
  function osToast(msg) {
    if (!OS) return;
    var t = el('div', 'os-toast', esc(msg)); OS.screen.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 1700);
  }
  function notify(title, body) {
    if (!OS) return; var st = OS.st;
    st.notifs.unshift({ title: title, body: body, t: Date.now() });
    while (st.notifs.length > 12) st.notifs.pop();
    osToast(title + ' — ' + body);
    if (OS.shadeOpen) renderShade();
  }

  function openApp(id, params) {
    if (!OS) return;
    var top = OS.stack[OS.stack.length - 1];
    if (top && top.id === id) { renderApp(); return; }
    if (!A[id]) { osToast('App unavailable'); return; }
    if (OS.st.installed.indexOf(id) === -1) { osToast(META[id] ? META[id].name + ' is not installed' : 'App missing'); return; }
    OS.stack.push({ id: id, params: params || {}, cleanup: null });
    OS.recents = OS.recents.filter(function (r) { return r !== id; }); OS.recents.unshift(id);
    renderApp();
  }
  function osBack() {
    if (!OS) return;
    var top = OS.stack[OS.stack.length - 1];
    if (top && top.cleanup) try { top.cleanup(); } catch (e) {}
    OS.stack.pop(); renderApp();
  }
  function osHome() {
    if (!OS) return;
    OS.stack.forEach(function (f) { if (f.cleanup) try { f.cleanup(); } catch (e) {} });
    OS.stack = []; hideShade(); hideRecents(); closeDrawer(); renderHome();
  }
  function renderApp() {
    if (!OS) return;
    hideShade(); closeDrawer(); hideRecents();
    if (!OS.stack.length) { renderHome(); return; }
    OS.body.innerHTML = '';
    var top = OS.stack[OS.stack.length - 1];
    var cleanup = A[top.id](OS.body, OS.phone, OS.st, api(), top.params);
    top.cleanup = cleanup;
  }
  function renderHome() {
    if (!OS) return;
    OS.stack.forEach(function (f) { if (f.cleanup) try { f.cleanup(); } catch (e) {} });
    OS.stack = [];
    OS.body.innerHTML = '';
    OS.drawer.classList.remove('open'); OS.drawerOpen = false;
    hideShade(); hideRecents();
    applyWall();
    var home = el('div', 'os-home');
    var h = new Date().getHours(), greet = h < 12 ? 'Good morning' : (h < 18 ? 'Good afternoon' : 'Good evening');
    home.appendChild(el('div', 'os-greet', greet + ' ☁️'));
    var search = el('button', 'os-searchbar', '🔎 Search apps &amp; web'); search.addEventListener('click', openDrawer); home.appendChild(search);
    var grid = el('div', 'os-grid');
    OS.st.installed.filter(function (id) { return META[id] && !META[id].dock; }).forEach(function (id) { grid.appendChild(homeApp(id)); });
    home.appendChild(grid);
    var dock = el('div', 'os-dock');
    APP_META.filter(function (a) { return a.dock; }).forEach(function (a) { dock.appendChild(homeApp(a.id)); });
    home.appendChild(dock);
    OS.body.appendChild(home);
    if (OS.st.locked) renderLock(); else if (OS.lock) OS.lock.classList.remove('open');
  }
  function homeApp(id) {
    var a = META[id]; if (!a) return el('div');
    var b = el('button', 'os-app', '<i style="--c1:' + a.c[0] + ';--c2:' + a.c[1] + '">' + a.icon + '</i><span>' + esc(a.name) + '</span>');
    b.addEventListener('click', function () { openApp(id); });
    return b;
  }
  function openDrawer() {
    if (!OS) return; OS.drawerOpen = true;
    OS.drawer.innerHTML = '';
    var lock = OS.st.locked;
    if (lock) OS.drawer.innerHTML = '<div class="app-empty">Locked</div>';
    var inp = el('input'); inp.placeholder = 'Search apps…';
    var grid = el('div', 'os-grid');
    function fill() {
      grid.innerHTML = '';
      var q = inp.value.trim().toLowerCase();
      OS.st.installed.filter(function (id) { return META[id] && (!q || META[id].name.toLowerCase().indexOf(q) !== -1); }).forEach(function (id) { grid.appendChild(homeApp(id)); });
      if (q) { var w = el('button', 'app-btn primary', 'Search web for “' + esc(inp.value) + '”'); w.style.marginTop = '10px'; w.addEventListener('click', function () { closeDrawer(); openApp('browser'); setTimeout(function () { if (OS.browserGo) OS.browserGo(inp.value.trim()); }, 60); }); grid.appendChild(w); }
    }
    inp.addEventListener('input', fill);
    OS.drawer.appendChild(inp); OS.drawer.appendChild(grid); fill();
    OS.drawer.classList.add('open');
  }
  function closeDrawer() { if (OS) { OS.drawer.classList.remove('open'); OS.drawerOpen = false; } }
  function toggleRecents() { if (!OS) return; if (OS.recentsList) { hideRecents(); return; } renderRecents(); }
  function renderRecents() {
    if (!OS) return;
    var box = el('div', 'os-recents');
    box.appendChild(el('h3', null, 'Recent apps'));
    if (!OS.recents.length) box.appendChild(el('div', 'app-empty', 'No recent apps'));
    OS.recents.forEach(function (id) {
      var a = META[id]; if (!a) return;
      var r = el('div', 'os-recent', '<i style="--c1:' + a.c[0] + ';--c2:' + a.c[1] + '">' + a.icon + '</i><b>' + esc(a.name) + '</b>');
      r.addEventListener('click', function () { hideRecents(); openApp(id); });
      box.appendChild(r);
    });
    var clr = el('button', 'app-btn danger', 'Clear all'); clr.style.marginTop = 'auto'; clr.addEventListener('click', function () { OS.recents = []; osHome(); });
    box.appendChild(clr);
    OS.recentsList = box; OS.screen.appendChild(box);
  }
  function hideRecents() { if (OS && OS.recentsList) { OS.recentsList.remove(); OS.recentsList = null; } }
  function toggleShade() { if (!OS) return; OS.shadeOpen ? hideShade() : renderShade(); }
  function renderShade() {
    if (!OS) return;
    OS.shade.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><h4 style="margin:0">Notifications</h4><button class="app-btn" id="shClear">Clear</button></div>';
    var list = el('div');
    if (!OS.st.notifs.length) list.appendChild(el('div', 'app-empty', 'No notifications'));
    OS.st.notifs.forEach(function (n) {
      var d = el('div', 'notif', '<b>' + esc(n.title) + '</b>' + esc(n.body) + '<div style="opacity:.6;font-size:.6rem;margin-top:3px">' + new Date(n.t).toLocaleTimeString() + '</div>');
      list.appendChild(d);
    });
    OS.shade.appendChild(list);
    $('#shClear', OS.shade).addEventListener('click', function () { OS.st.notifs = []; renderShade(); });
    OS.shade.classList.add('open'); OS.shadeOpen = true;
  }
  function hideShade() { if (OS) { OS.shade.classList.remove('open'); OS.shadeOpen = false; } }
  function renderLock() {
    if (!OS) return;
    OS.lock.innerHTML = '';
    OS.lockTime = el('div', 'lk-time', clockStr());
    OS.lock.appendChild(OS.lockTime);
    OS.lock.appendChild(el('div', 'lk-date', new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })));
    OS.lock.appendChild(el('div', 'lk-hint', 'Tap to unlock'));
    OS.lock.classList.add('open');
    OS.lock.onclick = function () { OS.st.locked = false; save(); OS.lock.classList.remove('open'); renderHome(); };
  }
  function checkAlarms() {
    if (!OS) return; var now = new Date();
    OS.st.alarms.forEach(function (a) {
      if (a.on && a.h === now.getHours() && a.m === now.getMinutes() && a.last !== clockStr()) {
        a.last = clockStr(); notify('⏰ Alarm', a.label || 'Alarm ringing'); beep(880, 0.5);
      }
    });
  }

  /* ============================ APPS ============================ */
  var A = {};

  /* ---- BROWSER ---- */
  A.browser = function (mount, phone, st, api) {
    var B = st.browser;
    if (!B) B = st.browser = { tabs: [{ hist: ['home'], hi: 0 }], active: 0, bookmarks: (st.bookmarks || []).slice() };
    if (!B.tabs.length) B.tabs = [{ hist: ['home'], hi: 0 }];
    var ctrl = { abort: null };
    var app = el('div', 'app');
    var tabsBar = el('div', 'br-tabs'), bar = el('div', 'br-bar'), content = el('div', 'br-content');
    app.appendChild(tabsBar); app.appendChild(bar); app.appendChild(content); mount.appendChild(app);

    function tab() { return B.tabs[B.active]; }
    function cur() { return tab().hist[tab().hi]; }
    function urlOf() { var u = cur(); return u === 'home' ? '' : u; }
    function norm(u) {
      u = (u || '').trim(); if (!u) return '';
      if (/^https?:\/\//i.test(u)) return u;
      if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(u)) return 'https://' + u;
      return 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(u);
    }
    function go(u, push) {
      u = norm(u); if (!u) { showHome(); return; }
      if (push) { var t = tab(); t.hist = t.hist.slice(0, t.hi + 1); t.hist.push(u); t.hi = t.hist.length - 1; }
      else tab().hist[tab().hi] = u;
      load(u);
    }
    function load(u) {
      renderBar(); renderTabs();
      if (u === 'home') { showHome(); return; }
      if (ctrl.abort) try { ctrl.abort.abort(); } catch (e) {}
      ctrl.abort = new AbortController();
      content.innerHTML = '<div class="browser-status">⏳ Loading ' + esc(u) + '…</div>';
      fetchReadable(u, ctrl.abort.signal).then(function (html) {
        if (!OS || !OS.stack.length) return;
        showPage(html, u);
      }).catch(function (e) {
        if (e && e.name === 'AbortError') return;
        showError(u, e);
      });
    }
    function showHome() {
      content.innerHTML = '';
      var h = el('div', 'br-home');
      h.appendChild(el('h3', null, '☁️ Stratus Browser'));
      var s = el('button', 'os-searchbar', '🔎 Search the web (opens Wikipedia)');
      s.addEventListener('click', function () { openDrawer(); });
      h.appendChild(s);
      h.appendChild(el('p', null, '<span style="font-size:.68rem;opacity:.8">Real pages load live through a fetch proxy. Tap a shortcut:</span>'));
      var links = el('div', 'br-links');
      [['Cloud computing', '☁️', 'https://en.wikipedia.org/wiki/Cloud_computing'], ['Android OS', '🤖', 'https://en.wikipedia.org/wiki/Android_(operating_system)'], ['Example.com', '🌐', 'https://example.com'], ['Hacker News', '🟧', 'https://news.ycombinator.com'], ['DuckDuckGo Lite', '🦆', 'https://lite.duckduckgo.com/lite/'], ['MDN Web Docs', '📖', 'https://developer.mozilla.org/']].forEach(function (q) {
        var b = el('button', 'br-link', '<span>' + q[1] + '</span>' + q[0]); b.addEventListener('click', function () { go(q[2], true); }); links.appendChild(b);
      });
      h.appendChild(links);
      var bm = el('div', 'br-links');
      (B.bookmarks || []).forEach(function (u) {
        var b = el('button', 'br-link', '<span>★</span>' + esc(u.replace(/^https?:\/\//, '').slice(0, 20)));
        b.addEventListener('click', function () { go(u, true); }); bm.appendChild(b);
      });
      h.appendChild(bm);
      content.appendChild(h);
    }
    function showPage(text, u) {
      content.innerHTML = '';
      var isHtml = /^\s*</.test(text);
      if (isHtml) {
        content.appendChild(el('div', 'browser-status', '🔒 ' + esc(u.replace(/^https?:\/\//, '').slice(0, 46))));
        var doc = new DOMParser().parseFromString(text, 'text/html');
        doc.querySelectorAll('script,style,noscript,link,meta,iframe,object,embed,svg,video,audio,source').forEach(function (n) { n.remove(); });
        try { var base = doc.createElement('base'); base.href = u; doc.head.insertBefore(base, doc.head.firstChild); } catch (e) {}
        var wrap = el('div', 'web-page');
        var body = doc.body || doc.documentElement;
        try { wrap.appendChild(document.importNode(body, true)); } catch (e) { wrap.innerHTML = esc(body.textContent || ''); }
        wrap.querySelectorAll('a[href]').forEach(function (a) {
          a.addEventListener('click', function (e) { e.preventDefault(); var abs = absUrl(a.getAttribute('href'), u); if (abs) go(abs, true); });
        });
        wrap.querySelectorAll('img').forEach(function (im) { im.loading = 'lazy'; im.addEventListener('error', function () { im.style.display = 'none'; }); });
        content.appendChild(wrap);
      } else {
        content.appendChild(el('div', 'browser-status', '🔒 ' + esc(u.replace(/^https?:\/\//, '').slice(0, 46))));
        content.appendChild(el('div', 'web-page', '<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:.72rem">' + esc(text.slice(0, 20000)) + '</pre>'));
      }
      renderTabs();
    }
    function showError(u, e) {
      content.innerHTML = '';
      var box = el('div', 'br-home');
      box.appendChild(el('h3', null, '⚠️ Couldn\'t load page'));
      box.appendChild(el('p', null, esc(u)));
      box.appendChild(el('p', null, '<span style="font-size:.68rem;opacity:.8">' + esc((e && e.message) || 'Network unavailable in this preview.') + '</span>'));
      var b = el('button', 'br-link', '<span>↻</span>Retry'); b.addEventListener('click', function () { load(u); }); box.appendChild(b);
      var h = el('button', 'br-link', '<span>🏠</span>Home'); h.addEventListener('click', function () { go('home', false); }); box.appendChild(h);
      content.appendChild(box);
    }
    function absUrl(href, base) { try { return new URL(href, base).href; } catch (e) { return /^https?:\/\//i.test(href) ? href : null; } }
    function renderBar() {
      bar.innerHTML = '';
      function ib(label, fn, dis) { var b = el('button', null, label); b.disabled = !!dis; b.addEventListener('click', fn); bar.appendChild(b); return b; }
      var t = tab();
      ib('‹', function () { if (t.hi > 0) { t.hi--; load(cur()); } }, t.hi <= 0);
      ib('›', function () { if (t.hi < t.hist.length - 1) { t.hi++; load(cur()); } }, t.hi >= t.hist.length - 1);
      ib('↻', function () { if (cur() === 'home') showHome(); else load(cur()); });
      var inp = el('input'); inp.value = urlOf(); inp.placeholder = 'Search or enter address';
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { inp.blur(); go(inp.value, true); } });
      bar.appendChild(inp);
      ib('★', function () {
        var u = urlOf(); if (!u) return;
        B.bookmarks = B.bookmarks || [];
        if (B.bookmarks.indexOf(u) !== -1) { B.bookmarks = B.bookmarks.filter(function (x) { return x !== u; }); api.toast('Bookmark removed'); }
        else { B.bookmarks.push(u); api.toast('Bookmarked'); }
        st.bookmarks = B.bookmarks; api.save();
      });
    }
    function renderTabs() {
      tabsBar.innerHTML = '';
      B.tabs.forEach(function (t, i) {
        var label = t.hist[t.hi] === 'home' ? 'New tab' : (t.hist[t.hi].replace(/^https?:\/\//, '').split('/')[0] || 'Page');
        var tabEl = el('div', 'br-tab' + (i === B.active ? ' active' : ''), esc(label.slice(0, 16)) + ' <x>✕</x>');
        tabEl.addEventListener('click', function () { B.active = i; renderBar(); renderTabs(); load(cur()); });
        tabEl.querySelector('x').addEventListener('click', function (e) {
          e.stopPropagation(); B.tabs.splice(i, 1);
          if (!B.tabs.length) B.tabs = [{ hist: ['home'], hi: 0 }];
          B.active = clamp(B.active, 0, B.tabs.length - 1); renderBar(); renderTabs(); load(cur());
        });
        tabsBar.appendChild(tabEl);
      });
      var plus = el('div', 'br-tab', '＋'); plus.addEventListener('click', function () { B.tabs.push({ hist: ['home'], hi: 0 }); B.active = B.tabs.length - 1; renderBar(); renderTabs(); showHome(); });
      tabsBar.appendChild(plus);
    }
    OS.browserGo = function (q) { go(q, true); };
    renderBar(); renderTabs(); load(cur());
    return function () { if (ctrl.abort) try { ctrl.abort.abort(); } catch (e) {} OS.browserGo = null; };
  };
  function fetchReadable(u, signal) {
    var attempts = [wikiParse(u), jina(u), corsProxy(u), allOrigins(u)];
    var i = 0;
    function next() {
      if (signal && signal.aborted) return Promise.reject(abortErr());
      if (i >= attempts.length) return Promise.reject(new Error('Could not reach the network'));
      return runAttempt(attempts[i++], 9000, signal).catch(function (e) {
        if (signal && signal.aborted) throw abortErr();
        return next();
      });
    }
    return next();
  }
  function abortErr() { return Object.assign(new Error('aborted'), { name: 'AbortError' }); }
  function runAttempt(fn, ms, outer) {
    return new Promise(function (resolve, reject) {
      var ctrl = new AbortController(), settled = false;
      var to = setTimeout(function () { ctrl.abort(); reject(new Error('timeout')); }, ms);
      if (outer) outer.addEventListener('abort', function () { ctrl.abort(); reject(abortErr()); });
      fn(ctrl.signal).then(function (v) { if (settled) return; settled = true; clearTimeout(to); resolve(v); },
        function (e) { if (settled) return; settled = true; clearTimeout(to); reject(e); });
    });
  }
  function readText(sig, url) { return fetch(url, { signal: sig }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }); }
  function wikiParse(u) {
    return function (sig) {
      var m = /^https?:\/\/([a-z-]+)\.wikipedia\.org\/wiki\/([^?#]+)/i.exec(u);
      if (!m) return Promise.reject(new Error('not a wiki article'));
      var lang = m[1], title = decodeURIComponent(m[2]).replace(/_/g, ' ');
      var api = 'https://' + lang + '.wikipedia.org/w/api.php?action=parse&page=' + encodeURIComponent(title) + '&prop=text&format=json&origin=*&redirects=1';
      return fetch(api, { signal: sig }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) { if (!j.parse || !j.parse.text) throw new Error('no article'); return j.parse.text['*']; });
    };
  }
  function jina(u) { return function (sig) { return readText(sig, 'https://r.jina.ai/' + u); }; }
  function corsProxy(u) { return function (sig) { return readText(sig, 'https://corsproxy.io/?' + encodeURIComponent(u)); }; }
  function allOrigins(u) { return function (sig) { return readText(sig, 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u)); }; }

  /* ---- DIALER ---- */
  A.dialer = function (mount, phone, st, api) {
    var app = el('div', 'app');
    var top = el('div', 'app-top', '<h3>📞 Phone</h3>');
    var tabBtn = el('button', 'app-btn', 'Recents'); top.appendChild(tabBtn);
    app.appendChild(top);
    var body = el('div', 'app-scroll'); body.style.display = 'flex'; body.style.flexDirection = 'column';
    app.appendChild(body); mount.appendChild(app);
    var callCleanup = null;

    function keypad() {
      body.innerHTML = '';
      var disp = el('div', 'dial-display', '');
      body.appendChild(disp);
      var grid = el('div', 'dial-grid');
      [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']].forEach(function (k) {
        var b = el('button', 'dial-key', k[0] + (k[1] ? '<small>' + k[1] + '</small>' : ''));
        b.addEventListener('click', function () { disp.textContent += k[0]; });
        grid.appendChild(b);
      });
      body.appendChild(grid);
      var del = el('button', 'app-btn', '⌫ Delete'); del.style.margin = '12px auto 0';
      del.addEventListener('click', function () { disp.textContent = disp.textContent.slice(0, -1); });
      body.appendChild(del);
      var call = el('button', 'dial-call', '📞');
      call.addEventListener('click', function () { startCall(disp.textContent.trim()); });
      body.appendChild(call);
      body.appendChild(el('p', null, '<span style="font-size:.62rem;color:var(--mut)">Tip: tap Recents to call a saved contact.</span>'));
    }
    function startCall(num) {
      var contact = CONTACTS.filter(function (c) { return c.num === num || c.name.toLowerCase() === (num || '').toLowerCase(); })[0];
      var name = contact ? contact.name : (num || 'Unknown');
      var sec = 0;
      var screen = el('div', 'call-screen', '<div style="font-size:.72rem;opacity:.85">Calling</div><div style="font-size:1.25rem;font-weight:800">' + esc(name) + '</div><div class="dur">00:00</div>');
      var dur = screen.querySelector('.dur');
      var hang = el('button', 'hang', '✕'); screen.appendChild(hang);
      var iv = setInterval(function () { sec++; dur.textContent = pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }, 1000);
      function end() {
        clearInterval(iv); screen.remove();
        st.calllog.unshift({ name: name, num: num || 'unknown', when: Date.now(), dur: sec });
        api.save(); api.notify('Call ended', name + ' · ' + pad(Math.floor(sec / 60)) + ':' + pad(sec % 60));
      }
      hang.addEventListener('click', end);
      callCleanup = function () { clearInterval(iv); if (screen.parentNode) screen.remove(); };
      app.appendChild(screen);
    }
    function recents() {
      body.innerHTML = '';
      body.appendChild(el('div', 'app-empty', st.calllog.length ? '' : 'No recent calls — dial a number.'));
      (st.calllog || []).forEach(function (c) {
        var row = el('div', 'file-row', '<span class="ic">📞</span><div><b>' + esc(c.name) + '</b><div style="font-size:.6rem;color:var(--mut)">' + new Date(c.when).toLocaleString() + ' · ' + c.dur + 's</div></div><span class="sz">↻</span>');
        row.addEventListener('click', function () { startCall(c.num); });
        body.appendChild(row);
      });
      body.appendChild(el('div', 'app-empty', 'Contacts'));
      CONTACTS.forEach(function (c) {
        var row = el('div', 'file-row', '<span class="avatar" style="background:linear-gradient(135deg,' + c.c[0] + ',' + c.c[1] + ')">' + c.name[0] + '</span><div><b>' + esc(c.name) + '</b><div style="font-size:.6rem;color:var(--mut)">' + esc(c.num) + '</div></div><span class="sz">📞</span>');
        row.addEventListener('click', function () { startCall(c.num); });
        body.appendChild(row);
      });
    }
    tabBtn.addEventListener('click', function () { tabBtn.textContent = tabBtn.textContent === 'Recents' ? 'Keypad' : 'Recents'; tabBtn.textContent === 'Recents' ? keypad() : recents(); });
    keypad();
    return function () { if (callCleanup) callCleanup(); };
  };

  /* ---- MESSAGES ---- */
  A.messages = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>💬 Messages</h3>'); var body = el('div', 'app-scroll');
    app.appendChild(top); app.appendChild(body); mount.appendChild(app);
    var chatIv = null;
    function listView() {
      body.innerHTML = '';
      CONTACTS.forEach(function (c) {
        var th = st.threads[c.id] || [];
        var last = th[th.length - 1];
        var row = el('div', 'row-card thread', '<span class="avatar" style="background:linear-gradient(135deg,' + c.c[0] + ',' + c.c[1] + ')">' + c.name[0] + '</span><div style="flex:1"><b style="font-size:.76rem">' + esc(c.name) + '</b><div style="font-size:.64rem;color:var(--mut)">' + esc(last ? last.text : 'No messages') + '</div></div>');
        row.addEventListener('click', function () { thread(c); });
        body.appendChild(row);
      });
    }
    function thread(c) {
      body.innerHTML = '';
      var chat = el('div', 'chat');
      var log = el('div', 'chat-log');
      chat.appendChild(log);
      var input = el('div', 'chat-input');
      var i = el('input'); i.placeholder = 'Text message…';
      var send = el('button', 'app-btn primary', 'Send'); input.appendChild(i); input.appendChild(send);
      chat.appendChild(input); body.appendChild(chat);
      function paint() {
        log.innerHTML = '';
        (st.threads[c.id] || []).forEach(function (m) {
          log.appendChild(el('div', 'bubble' + (m.me ? ' me' : ''), esc(m.text) + '<time>' + new Date(m.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</time>'));
        });
        log.scrollTop = log.scrollHeight;
      }
      function doSend() {
        var v = i.value.trim(); if (!v) return;
        st.threads[c.id] = st.threads[c.id] || [];
        st.threads[c.id].push({ me: true, text: v, t: Date.now() }); i.value = ''; paint(); api.save();
        clearTimeout(chatIv);
        chatIv = setTimeout(function () {
          var replies = ['Got it ✅', 'On it — give me 5.', 'Nice, that works for me.', 'Deploying now 🚀', 'Thanks for the update!', 'Let me check and get back to you.'];
          st.threads[c.id].push({ me: false, text: replies[Math.floor(Math.random() * replies.length)], t: Date.now() });
          paint(); api.save();
          if (!OS || OS.stack[OS.stack.length - 1].id !== 'messages') api.notify(c.name, st.threads[c.id].slice(-1)[0].text);
        }, 900);
      }
      send.addEventListener('click', doSend);
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSend(); });
      paint();
      var backRow = el('div', 'app-top', ''); backRow.innerHTML = '<button class="app-btn" id="mBack">‹ Back</button><h3 style="margin:0 0 0 6px">' + esc(c.name) + '</h3>';
      body.insertBefore(backRow, chat);
      backRow.querySelector('#mBack').addEventListener('click', listView);
    }
    listView();
    return function () { if (chatIv) clearTimeout(chatIv); };
  };

  /* ---- CAMERA ---- */
  A.camera = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>📷 Camera</h3>');
    var flip = el('button', 'app-btn', 'Switch'); top.appendChild(flip);
    app.appendChild(top);
    var view = el('div', 'cam-view'); app.appendChild(view);
    var video = el('video'); video.autoplay = true; video.muted = true; video.playsInline = true; view.appendChild(video);
    var controls = el('div', 'cam-controls');
    var shutter = el('button', 'cam-shutter'); controls.appendChild(shutter);
    app.appendChild(controls); mount.appendChild(app);
    var facing = 'user', stream = null, ready = false;
    function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { fallback(); return; }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false }).then(function (s) {
        stream = s; OS.camStream = s; video.srcObject = s; ready = true; view.querySelector('.cam-fallback') && view.querySelector('.cam-fallback').remove();
      }).catch(function () { fallback(); });
    }
    function fallback() {
      ready = false; video.style.display = 'none';
      if (!view.querySelector('.cam-fallback')) view.appendChild(el('div', 'cam-fallback', '📷'));
    }
    function capture() {
      var W = 480, H = 640, cv = el('canvas'); cv.width = W; cv.height = H;
      var ctx = cv.getContext('2d');
      if (ready) { ctx.drawImage(video, 0, 0, W, H); }
      else {
        var g = ctx.createLinearGradient(0, 0, W, H);
        var hues = ['#312e81', '#0e7490', '#be185d', '#047857'];
        g.addColorStop(0, hues[Math.floor(Math.random() * hues.length)]); g.addColorStop(1, '#0b1020');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = 'bold 34px sans-serif'; ctx.fillText('☁️', 24, 70);
        ctx.font = 'bold 26px sans-serif'; ctx.fillText(device(phone.deviceId).name, 24, H - 60);
        ctx.font = '18px sans-serif'; ctx.fillText(new Date().toLocaleString(), 24, H - 30);
      }
      var url = cv.toDataURL('image/jpeg', 0.82);
      st.gallery.unshift(url); api.save();
      api.toast('Photo saved to Gallery'); api.notify('Camera', 'New photo captured');
    }
    flip.addEventListener('click', function () { facing = facing === 'user' ? 'environment' : 'user'; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); start(); });
    shutter.addEventListener('click', capture);
    start();
    return function () { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); if (OS) OS.camStream = null; };
  };

  /* ---- GALLERY ---- */
  A.gallery = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>🖼️ Gallery</h3>');
    var add = el('button', 'app-btn', 'Sample'); top.appendChild(add); app.appendChild(top);
    var body = el('div', 'app-scroll'); app.appendChild(body); mount.appendChild(app);
    function paint() {
      body.innerHTML = '';
      if (!st.gallery.length) { body.appendChild(el('div', 'app-empty', 'No photos yet. Open Camera and capture one, or tap Sample.')); return; }
      var grid = el('div', 'gal-grid');
      st.gallery.forEach(function (src, idx) {
        var b = el('button', null, '<img src="' + src + '" alt="photo ' + (idx + 1) + '" />');
        b.addEventListener('click', function () { view(src); }); grid.appendChild(b);
      });
      body.appendChild(grid);
    }
    function view(src) {
      var v = el('div', 'gal-viewer', '<img src="' + src + '" />');
      var bar = el('div', 'app-top', '<button class="app-btn" id="gBack">‹</button><div class="sp"><button class="app-btn" id="gDel">Delete</button><a class="app-btn" id="gDl" download="stratus-photo.jpg" href="' + src + '">Save</a></div>');
      v.appendChild(bar); app.appendChild(v);
      bar.querySelector('#gBack').addEventListener('click', function () { v.remove(); });
      bar.querySelector('#gDel').addEventListener('click', function () { st.gallery = st.gallery.filter(function (x) { return x !== src; }); api.save(); v.remove(); paint(); });
    }
    add.addEventListener('click', function () {
      var cv = el('canvas'); cv.width = cv.height = 300; var ctx = cv.getContext('2d');
      for (var i = 0; i < 6; i++) { ctx.fillStyle = 'hsl(' + Math.floor(Math.random() * 360) + ',70%,60%)'; ctx.fillRect(Math.random() * 200, Math.random() * 200, 120, 120); }
      st.gallery.unshift(cv.toDataURL('image/jpeg', 0.8)); api.save(); paint();
    });
    paint();
    return null;
  };

  /* ---- NOTES ---- */
  A.notes = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>📝 Notes</h3>');
    var add = el('button', 'app-btn primary', 'New'); top.appendChild(add); app.appendChild(top);
    var body = el('div', 'app-scroll'); app.appendChild(body); mount.appendChild(app);
    function list() {
      body.innerHTML = '';
      if (!st.notes.length) body.appendChild(el('div', 'app-empty', 'No notes. Tap New.'));
      st.notes.forEach(function (n) {
        var row = el('div', 'row-card', '<div class="note-row"><b>' + esc(n.title || 'Untitled') + '</b></div><p style="margin:3px 0 0;font-size:.64rem;color:var(--mut)">' + esc((n.body || '').slice(0, 60)) + '</p>');
        row.addEventListener('click', function () { edit(n); }); body.appendChild(row);
      });
    }
    function edit(n) {
      body.innerHTML = '';
      var ed = el('div', 'note-edit');
      var title = el('input'); title.value = n.title || ''; title.placeholder = 'Title';
      var ta = el('textarea'); ta.value = n.body || ''; ta.placeholder = 'Write something…';
      var bar = el('div', 'app-top', '<button class="app-btn" id="nBack">‹</button><div class="sp"><button class="app-btn danger" id="nDel">Delete</button></div>');
      ed.appendChild(title); ed.appendChild(ta);
      body.appendChild(bar); body.appendChild(ed);
      function persist() { n.title = title.value; n.body = ta.value; n.t = Date.now(); api.save(); }
      title.addEventListener('input', persist); ta.addEventListener('input', persist);
      bar.querySelector('#nBack').addEventListener('click', function () { persist(); list(); });
      bar.querySelector('#nDel').addEventListener('click', function () { st.notes = st.notes.filter(function (x) { return x.id !== n.id; }); api.save(); list(); });
    }
    add.addEventListener('click', function () { var n = { id: randId(), title: '', body: '', t: Date.now() }; st.notes.unshift(n); api.save(); edit(n); });
    list();
    return null;
  };

  /* ---- CALCULATOR ---- */
  A.calculator = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>🧮 Calculator</h3>'); app.appendChild(top);
    var disp = el('div', 'calc-display', '0'), sub = el('div', 'calc-sub', '');
    var grid = el('div', 'calc-grid');
    app.appendChild(disp); app.appendChild(sub); app.appendChild(grid); mount.appendChild(app);
    var expr = '';
    function evaluate() {
      var s = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      if (!s) return null; if (!/^[0-9+\-*/.() %]+$/.test(s)) return null;
      try { var r = Function('"use strict";return (' + s + ')')(); return (typeof r === 'number' && isFinite(r)) ? r : null; } catch (e) { return null; }
    }
    function refresh() { disp.textContent = expr || '0'; var r = evaluate(); sub.textContent = (r != null && expr) ? '= ' + +r.toFixed(10) : ''; }
    var keys = [['C', 'cl'], ['(', 'op'], [')', 'op'], ['⌫', 'cl'], ['7', ''], ['8', ''], ['9', ''], ['÷', 'op'], ['4', ''], ['5', ''], ['6', ''], ['×', 'op'], ['1', ''], ['2', ''], ['3', ''], ['−', 'op'], ['0', ''], ['.', ''], ['%', 'op'], ['+', 'op'], ['=', 'eq']];
    keys.forEach(function (k) {
      var b = el('button', k[1] === 'eq' ? 'eq' : (k[1] ? k[1] : ''), k[0]);
      if (k[0] === '=') b.style.gridColumn = 'span 2'; if (k[0] === '0') b.style.gridColumn = 'span 2';
      b.addEventListener('click', function () {
        if (k[0] === 'C') { expr = ''; }
        else if (k[0] === '⌫') { expr = expr.slice(0, -1); }
        else if (k[0] === '=') { var r = evaluate(); if (r != null) { expr = String(+r.toFixed(10)); api.save(); } }
        else expr += k[0];
        refresh();
      });
      grid.appendChild(b);
    });
    refresh();
    return null;
  };

  /* ---- CLOCK ---- */
  A.clock = function (mount, phone, st, api) {
    var app = el('div', 'app'); var tabs = el('div', 'clock-tabs'); var body = el('div', 'app-scroll');
    ['Clock', 'Alarm', 'Stopwatch', 'Timer'].forEach(function (name) {
      var b = el('button', null, name); b.addEventListener('click', function () { $$('button', tabs).forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); show(name); });
      tabs.appendChild(b);
    });
    app.appendChild(tabs); app.appendChild(body); mount.appendChild(app);
    var iv = null, sw = 0, swRun = false, timerLeft = 0, timerRun = false;
    function clear() { if (iv) { clearInterval(iv); iv = null; } }
    function show(name) {
      clear(); body.innerHTML = '';
      if (name === 'Clock') {
        var face = el('div', 'clock-face'); var big = el('div', 'big', clockStr()); var d = el('div', null, new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
        face.appendChild(big); face.appendChild(d); body.appendChild(face);
        [['Frankfurt', 2], ['New York', -5], ['Tokyo', 9], ['London', 0]].forEach(function (c) {
          var utc = new Date().getUTCHours() + new Date().getUTCMinutes() / 60; var t = (utc + c[1] + 24) % 24;
          body.appendChild(el('div', 'worldrow', '<span>' + c[0] + '</span><b>' + pad(Math.floor(t)) + ':' + pad(Math.round((t % 1) * 60)) + '</b>'));
        });
        iv = setInterval(function () { big.textContent = clockStr(); }, 1000);
      } else if (name === 'Alarm') {
        var add = el('div', 'app-top', '<button class="app-btn primary" id="aAdd">+ Add alarm</button>'); body.appendChild(add);
        var list = el('div'); body.appendChild(list);
        function paint() {
          list.innerHTML = ''; if (!st.alarms.length) list.appendChild(el('div', 'app-empty', 'No alarms.'));
          st.alarms.forEach(function (a) {
            var row = el('div', 'file-row', '<span class="ic">⏰</span><b style="font-size:1rem">' + pad(a.h) + ':' + pad(a.m) + '</b><span class="sz">' + (a.on ? 'ON' : 'off') + '</span>');
            row.addEventListener('click', function () { a.on = !a.on; api.save(); paint(); });
            var del = el('button', 'app-btn danger', '✕'); del.addEventListener('click', function (e) { e.stopPropagation(); st.alarms = st.alarms.filter(function (x) { return x !== a; }); api.save(); paint(); });
            row.appendChild(del); list.appendChild(row);
          });
        }
        add.querySelector('#aAdd').addEventListener('click', function () { var n = new Date(Date.now() + 60000); st.alarms.push({ id: randId(), h: n.getHours(), m: n.getMinutes(), on: true, label: 'Alarm' }); api.save(); paint(); api.toast('Alarm set for ' + clockStr(n)); });
        paint();
      } else if (name === 'Stopwatch') {
        var big2 = el('div', 'clock-face'); var t2 = el('div', 'big', '00:00.00'); big2.appendChild(t2); body.appendChild(big2);
        var start = el('button', 'app-btn primary', 'Start'); var reset = el('button', 'app-btn', 'Reset');
        var row = el('div', 'inst-actions'); row.style.justifyContent = 'center'; row.appendChild(start); row.appendChild(reset); body.appendChild(row);
        start.addEventListener('click', function () { swRun = !swRun; start.textContent = swRun ? 'Pause' : 'Start'; api.save(); });
        reset.addEventListener('click', function () { sw = 0; swRun = false; start.textContent = 'Start'; t2.textContent = '00:00.00'; });
        var last = performance.now();
        iv = setInterval(function () { var now = performance.now(); if (swRun) { sw += (now - last); } last = now; var cs = Math.floor(sw / 10); t2.textContent = pad(Math.floor(cs / 6000)) + ':' + pad(Math.floor(cs / 100) % 60) + '.' + pad(cs % 100); }, 50);
      } else {
        var face3 = el('div', 'clock-face'); var t3 = el('div', 'big', '00:00'); face3.appendChild(t3); body.appendChild(face3);
        var input = el('input'); input.value = '1'; input.style.cssText = 'width:70px;text-align:center;background:rgba(255,255,255,.1);border:1px solid var(--line);border-radius:10px;color:#fff;padding:6px';
        var wrap = el('div'); wrap.style.cssText = 'display:flex;gap:8px;justify-content:center;align-items:center'; wrap.appendChild(input); wrap.appendChild(el('span', null, 'minutes'));
        body.appendChild(wrap);
        var start3 = el('button', 'app-btn primary', 'Start timer'); start3.style.margin = '14px auto 0'; start3.style.display = 'block'; body.appendChild(start3);
        start3.addEventListener('click', function () {
          if (timerRun) { timerRun = false; start3.textContent = 'Start timer'; return; }
          timerLeft = Math.max(1, parseInt(input.value, 10) || 1) * 60; timerRun = true; start3.textContent = 'Cancel';
        });
        iv = setInterval(function () { if (!timerRun) return; timerLeft--; if (timerLeft <= 0) { timerRun = false; beep(660, 0.8); api.notify('⏰ Timer', 'Time is up!'); } t3.textContent = pad(Math.floor(Math.max(0, timerLeft) / 60)) + ':' + pad(Math.max(0, timerLeft) % 60); }, 1000);
      }
    }
    tabs.children[0].classList.add('active'); show('Clock');
    return clear;
  };

  /* ---- MUSIC (global audio, keeps playing across apps) ---- */
  A.music = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>🎵 Music</h3>'); app.appendChild(top);
    var body = el('div', 'app-scroll'); app.appendChild(body); mount.appendChild(app);
    if (!OS.music) OS.music = createMusic();
    var M = OS.music;
    var art = el('div', 'music-art', '🎧');
    var title = el('div', null, '');
    var viz = el('div', 'viz'); for (var i = 0; i < 16; i++) viz.appendChild(el('i'));
    var row = el('div', 'inst-actions'); row.style.justifyContent = 'center';
    var prev = el('button', 'app-btn', '⏮'); var play = el('button', 'app-btn primary', '▶ Play'); var next = el('button', 'app-btn', '⏭');
    row.appendChild(prev); row.appendChild(play); row.appendChild(next);
    var vol = el('input'); vol.type = 'range'; vol.min = 0; vol.max = 100; vol.value = st.volume || 60; vol.style.width = '100%';
    body.appendChild(art); title.style.cssText = 'text-align:center;font-weight:800;margin:4px 0'; body.appendChild(title); body.appendChild(viz); body.appendChild(row);
    body.appendChild(el('div', 'app-empty', 'Volume')); body.appendChild(vol);
    function paint() { title.textContent = M.track().name + (M.playing ? ' · playing' : ''); play.textContent = M.playing ? '⏸ Pause' : '▶ Play'; }
    play.addEventListener('click', function () { M.toggle(); paint(); });
    next.addEventListener('click', function () { M.next(); paint(); });
    prev.addEventListener('click', function () { M.prev(); paint(); });
    vol.addEventListener('input', function () { st.volume = +vol.value; M.setVolume(st.volume / 100); });
    paint();
    var iv = setInterval(function () { for (var i = 0; i < viz.children.length; i++) { var bar = viz.children[i]; bar.style.height = (M.playing ? (12 + Math.random() * 32) : 4) + 'px'; } if (OS && OS.stack[OS.stack.length - 1].id === 'music') paint(); }, 130);
    return function () { clearInterval(iv); };
  };
  function createMusic() {
    var notes = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880 };
    var tracks = [
      { name: 'Cloud Drift', seq: ['C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'C5', 'E5'] },
      { name: 'Data Rain', seq: ['A4', 'C5', 'A4', 'G4', 'F4', 'G4', 'A4', 'C5'] },
      { name: 'Uptime', seq: ['G4', 'B4', 'D5', 'B4', 'G4', 'D5', 'G5', 'D5'] }
    ];
    var ti = 0, step = 0, playing = false, ctx = null, gain = null, timer = null;
    function ensure() { if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC(); gain = ctx.createGain(); gain.gain.value = 0.06; gain.connect(ctx.destination); } return true; }
    function tick() { var t = tracks[ti].seq[step % tracks[ti].seq.length]; step++; var f = notes[t]; if (!ctx || !gain) return; var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.value = 0; o.connect(g); g.connect(gain); var now = ctx.currentTime; g.gain.linearRampToValueAtTime(0.9, now + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + 0.42); o.start(now); o.stop(now + 0.45); }
    return {
      playing: false,
      track: function () { return tracks[ti]; },
      setVolume: function (v) { if (gain) gain.gain.value = 0.1 * v; },
      toggle: function () { playing = !playing; this.playing = playing; if (playing) { if (!ensure()) { playing = false; this.playing = false; return; } if (ctx.state === 'suspended') ctx.resume(); timer = setInterval(tick, 480); tick(); } else { clearInterval(timer); } },
      next: function () { ti = (ti + 1) % tracks.length; step = 0; },
      prev: function () { ti = (ti - 1 + tracks.length) % tracks.length; step = 0; },
      stop: function () { playing = false; clearInterval(timer); if (ctx) try { ctx.close(); } catch (e) {} ctx = null; }
    };
  }
  function beep(freq, dur) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      var ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = freq; o.connect(g); g.connect(ctx.destination); g.gain.value = 0.08;
      o.start(); o.stop(ctx.currentTime + dur); setTimeout(function () { ctx.close(); }, (dur + 0.1) * 1000);
    } catch (e) {}
  }

  /* ---- SETTINGS ---- */
  A.settings = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>⚙️ Settings</h3>'); app.appendChild(top);
    var body = el('div', 'app-scroll'); app.appendChild(body); mount.appendChild(app);
    function row(label, sub, control) {
      var r = el('div', 'row-card');
      var head = el('div', 'note-row', '<b>' + esc(label) + '</b>');
      r.appendChild(head); if (sub) r.appendChild(el('div', null, '<span style="font-size:.62rem;color:var(--mut)">' + esc(sub) + '</span>'));
      if (control) { control.style.marginTop = '8px'; r.appendChild(control); }
      body.appendChild(r); return r;
    }
    var wifi = el('button', 'app-btn', st.wifi ? 'Turn off' : 'Turn on');
    wifi.addEventListener('click', function () { st.wifi = !st.wifi; api.save(); api.toast('Wi-Fi ' + (st.wifi ? 'on' : 'off')); paint(); });
    row('Wi-Fi / 5G', st.wifi ? 'Connected · 34 ms' : 'Off', wifi);
    var bright = el('input'); bright.type = 'range'; bright.min = 20; bright.max = 100; bright.value = st.brightness; bright.style.width = '100%';
    bright.addEventListener('input', function () { st.brightness = +bright.value; applyBrightness(); api.save(); });
    row('Brightness', st.brightness + '%', bright);
    var vol = el('input'); vol.type = 'range'; vol.min = 0; vol.max = 100; vol.value = st.volume; vol.style.width = '100%';
    vol.addEventListener('input', function () { st.volume = +vol.value; api.save(); });
    row('Volume', st.volume + '%', vol);
    var wallRow = el('div', 'inst-actions');
    WALLS.forEach(function (w, i) {
      var b = el('button', 'app-btn' + (st.wall === i ? ' primary' : ''), 'W' + (i + 1));
      b.style.background = w; b.style.color = '#fff';
      b.addEventListener('click', function () { st.wall = i; api.save(); applyWall(); paint(); });
      wallRow.appendChild(b);
    });
    row('Wallpaper', WALLS[st.wall].slice(0, 24) + '…', wallRow);
    var lockBtn = el('button', 'app-btn', 'Lock now'); lockBtn.addEventListener('click', function () { st.locked = true; api.save(); api.home(); renderLock(); });
    row('Screen lock', 'Lock the phone screen', lockBtn);
    var resetBtn = el('button', 'app-btn danger', 'Reset phone'); resetBtn.addEventListener('click', function () { if (confirm('Reset this phone? Notes, photos and messages will be erased.')) { phone.state = null; phoneState(phone); seedThreads(phone.state); api.save(); api.toast('Phone reset'); api.home(); } });
    row('Reset', 'Erase all phone data', resetBtn);
    row('Device', device(phone.deviceId).name + ' · ' + device(phone.deviceId).chip);
    row('Region', phone.region + ' · ' + phone.image);
    row('About', 'Stratus Cloud OS 15 · build ' + phone.id);
    function paint() { mount.innerHTML = ''; A.settings(mount, phone, st, api); }
    return null;
  };

  /* ---- STORE ---- */
  A.store = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>🛍️ Store</h3>'); app.appendChild(top);
    var body = el('div', 'app-scroll'); app.appendChild(body); mount.appendChild(app);
    APP_META.forEach(function (a) {
      var installed = st.installed.indexOf(a.id) !== -1;
      var row = el('div', 'row-card', '');
      var head = el('div', 'thread', '<span class="avatar" style="background:linear-gradient(135deg,' + a.c[0] + ',' + a.c[1] + ')">' + a.icon + '</span><div style="flex:1"><b style="font-size:.78rem">' + esc(a.name) + '</b><div style="font-size:.6rem;color:var(--mut)">' + (a.dock ? 'System · ' : '') + (Math.round(10 + a.id.length * 3.7) + ' MB') + ' · ★ ' + (4 + (a.id.length % 10) / 10).toFixed(1) + '</div></div>');
      row.appendChild(head);
      var btn = el('button', 'app-btn' + (installed ? '' : ' primary'), installed ? 'Uninstall' : 'Install');
      btn.style.marginTop = '8px';
      btn.addEventListener('click', function () {
        if (st.installed.indexOf(a.id) !== -1) {
          if (a.dock || a.id === 'settings') { api.toast(a.name + ' is a system app'); return; }
          st.installed = st.installed.filter(function (x) { return x !== a.id; }); api.save(); api.toast(a.name + ' uninstalled'); renderHomeIf(); paint();
        } else {
          btn.textContent = 'Installing…'; btn.disabled = true;
          setTimeout(function () { st.installed.push(a.id); api.save(); api.toast(a.name + ' installed'); api.notify('Store', a.name + ' installed'); renderHomeIf(); paint(); }, 900);
        }
      });
      row.appendChild(btn); row.appendChild(el('div', null, '<button class="app-btn" data-open="' + a.id + '" style="margin-top:6px">Open</button>'));
      row.querySelector('[data-open]').addEventListener('click', function () { if (st.installed.indexOf(a.id) !== -1) api.go(a.id); else api.toast('Install it first'); });
      body.appendChild(row);
    });
    function renderHomeIf() { if (OS && !OS.stack.length) renderHome(); }
    function paint() { mount.innerHTML = ''; A.store(mount, phone, st, api); }
    return null;
  };

  /* ---- FILES ---- */
  A.files = function (mount, phone, st, api) {
    if (!st.files) st.files = { '/': ['DCIM', 'Download', 'Documents', 'build.apk', 'notes.txt'], '/DCIM': ['IMG_0042.jpg', 'IMG_0043.jpg'], '/Download': ['report.pdf', 'app-release.apk'], '/Documents': ['spec.md'] };
    var cwd = '/';
    var app = el('div', 'app'); var top = el('div', 'app-top'); var body = el('div', 'app-scroll');
    app.appendChild(top); app.appendChild(body); mount.appendChild(app);
    function paint() {
      top.innerHTML = '<h3 style="font-size:.8rem">📁 ' + esc(cwd) + '</h3>';
      if (cwd !== '/') { var up = el('button', 'app-btn', '↑ Up'); up.addEventListener('click', function () { cwd = '/' + cwd.split('/').filter(Boolean).slice(1).join('/'); if (cwd === '') cwd = '/'; paint(); }); top.appendChild(up); }
      body.innerHTML = '';
      var used = Math.min(96, 8 + st.gallery.length * 3 + Object.keys(st.files).length * 4);
      body.appendChild(el('div', 'row-card', '<b style="font-size:.72rem">Storage</b><div class="bar2" style="margin-top:8px"><i style="width:' + used + '%"></i></div><div style="font-size:.6rem;color:var(--mut);margin-top:4px">' + (used * 0.5).toFixed(1) + ' GB of 128 GB used</div>'));
      (st.files[cwd] || []).forEach(function (name) {
        var isDir = !!st.files[(cwd === '/' ? '' : cwd) + '/' + name];
        var row = el('div', 'file-row', '<span class="ic">' + (isDir ? '📁' : '📄') + '</span><span>' + esc(name) + '</span><span class="sz">' + (isDir ? 'folder' : Math.round(name.length * 12.5) + ' KB') + '</span>');
        row.addEventListener('click', function () {
          if (isDir) { cwd = (cwd === '/' ? '' : cwd) + '/' + name; paint(); }
          else api.toast('Opening ' + name + '…');
        });
        body.appendChild(row);
      });
    }
    paint(); return null;
  };

  /* ---- MAPS ---- */
  A.maps = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>🗺️ Maps</h3>'); app.appendChild(top);
    var canvas = el('div', 'map-canvas'); var grid = el('div', 'map-grid'); canvas.appendChild(grid);
    app.appendChild(canvas); mount.appendChild(app);
    var ox = 0, oy = 0, scale = 1;
    var cities = [{ n: 'Frankfurt', x: 120, y: 90 }, { n: 'London', x: 60, y: 70 }, { n: 'New York', x: -160, y: 60 }, { n: 'Tokyo', x: 420, y: 120 }, { n: 'Singapore', x: 330, y: 260 }];
    var pins = [];
    function draw() {
      grid.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(' + scale + ')';
      pins.forEach(function (p) { p.remove(); }); pins = [];
      cities.forEach(function (c) {
        var pin = el('div', 'map-pin', '📍<div style="font-size:.55rem;background:rgba(0,0,0,.7);padding:1px 4px;border-radius:5px;white-space:nowrap">' + c.n + '</div>');
        pin.style.left = (150 + c.x * scale + ox) + 'px'; pin.style.top = (150 + c.y * scale + oy) + 'px';
        pin.addEventListener('click', function () { api.toast(c.n + ' · 34 ms'); });
        canvas.appendChild(pin); pins.push(pin);
      });
    }
    var search = el('div', 'map-search');
    var inp = el('input'); inp.placeholder = 'Search places…';
    var goBtn = el('button', 'app-btn primary', 'Go');
    search.appendChild(inp); search.appendChild(goBtn); canvas.appendChild(search);
    goBtn.addEventListener('click', function () {
      var q = inp.value.trim().toLowerCase(); if (!q) return;
      var c = cities.filter(function (x) { return x.n.toLowerCase().indexOf(q) !== -1; })[0];
      if (c) { ox = -c.x * scale; oy = -c.y * scale; draw(); api.toast('Flying to ' + c.n); } else api.toast('No results for “' + inp.value + '”');
    });
    var zoom = el('div', 'map-zoom'); var zi = el('button', null, '＋'), zo = el('button', null, '−');
    zi.addEventListener('click', function () { scale = Math.min(3, scale + 0.3); draw(); });
    zo.addEventListener('click', function () { scale = Math.max(0.5, scale - 0.3); draw(); });
    zoom.appendChild(zi); zoom.appendChild(zo); canvas.appendChild(zoom);
    var drag = false, sx, sy;
    canvas.addEventListener('mousedown', function (e) { drag = true; sx = e.clientX; sy = e.clientY; });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    function onMove(e) { if (!drag) return; ox += e.clientX - sx; oy += e.clientY - sy; sx = e.clientX; sy = e.clientY; draw(); }
    function onUp() { drag = false; }
    draw();
    return function () { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  };

  /* ---- CALENDAR ---- */
  A.calendar = function (mount, phone, st, api) {
    var view = new Date(); view.setDate(1);
    var app = el('div', 'app'); var top = el('div', 'app-top'); var body = el('div', 'app-scroll');
    app.appendChild(top); app.appendChild(body); mount.appendChild(app);
    function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function paint() {
      body.innerHTML = '';
      var head = el('div', 'cal-head');
      var prev = el('button', 'app-btn', '‹'), next = el('button', 'app-btn', '›');
      var label = el('b', null, view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
      head.appendChild(prev); head.appendChild(label); head.appendChild(next); body.appendChild(head);
      prev.addEventListener('click', function () { view.setMonth(view.getMonth() - 1); paint(); });
      next.addEventListener('click', function () { view.setMonth(view.getMonth() + 1); paint(); });
      var grid = el('div', 'cal-grid');
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { grid.appendChild(el('div', 'dow', d)); });
      var first = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
      var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (var i = 0; i < first; i++) grid.appendChild(el('div', 'cal-day blank'));
      var today = new Date();
      for (var d = 1; d <= days; d++) {
        var date = new Date(view.getFullYear(), view.getMonth(), d), k = key(date);
        var cell = el('div', 'cal-day' + (k === key(today) ? ' today' : ''), String(d));
        if (st.events[k] && st.events[k].length) cell.appendChild(el('span', 'dot'));
        cell.addEventListener('click', function (kk) { return function () { addEvent(kk); }; }(k));
        grid.appendChild(cell);
      }
      body.appendChild(grid);
      var js = Object.keys(st.events).sort();
      body.appendChild(el('div', 'app-empty', js.length ? 'Your events' : 'Tap a day to add an event.'));
      js.forEach(function (k) { st.events[k].forEach(function (t) { body.appendChild(el('div', 'file-row', '<span class="ic">📌</span><div><b>' + esc(t) + '</b><div style="font-size:.6rem;color:var(--mut)">' + k + '</div></div>')); }); });
    }
    function addEvent(k) {
      var t = prompt('New event on ' + k + ':', '');
      if (!t) return; st.events[k] = st.events[k] || []; st.events[k].push(t); api.save(); paint(); api.toast('Event added');
    }
    paint(); return null;
  };

  /* ---- WEATHER ---- */
  A.weather = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>⛅ Weather</h3>'); app.appendChild(top);
    var body = el('div', 'app-scroll'); app.appendChild(body); mount.appendChild(app);
    var cities = ['Frankfurt', 'London', 'New York', 'Tokyo', 'Singapore'];
    var city = st.wxCity || 'Frankfurt';
    var sel = el('select'); sel.style.cssText = 'width:100%;background:rgba(255,255,255,.08);border:1px solid var(--line);color:#fff;border-radius:10px;padding:8px';
    cities.forEach(function (c) { var o = el('option'); o.value = o.textContent = c; if (c === city) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () { st.wxCity = city = sel.value; api.save(); paint(); });
    body.appendChild(sel);
    function seed() { var s = 0; for (var i = 0; i < city.length; i++) s += city.charCodeAt(i); return s; }
    function paint() {
      while (body.children.length > 1) body.lastChild.remove();
      var s = seed(), base = 8 + (s % 18), icon = ['☀️', '⛅', '🌧️', '⛈️', '🌤️'][s % 5];
      var now = el('div', 'wx-now', '<div style="font-size:2.6rem">' + icon + '</div><div class="t">' + base + '°</div><div style="font-size:.7rem;color:var(--mut)">' + city + ' · ' + ['Clear', 'Partly cloudy', 'Rain', 'Thunderstorms', 'Mostly sunny'][s % 5] + '</div>');
      body.appendChild(now);
      var hours = el('div', 'wx-hours');
      var h = new Date().getHours();
      for (var i = 0; i < 8; i++) {
        var hh = (h + i) % 24, temp = base + Math.round(3 * Math.sin(i / 2 + s) );
        hours.appendChild(el('div', 'wx-h', '<div>' + pad(hh) + ':00</div><div class="i">' + ['☀️', '⛅', '🌧️'][(s + i) % 3] + '</div><div>' + temp + '°</div>'));
      }
      body.appendChild(hours);
      body.appendChild(el('div', 'row-card', 'Humidity <b>' + (45 + s % 40) + '%</b> · Wind <b>' + (5 + s % 20) + ' km/h</b> · Feels like <b>' + (base - 1) + '°</b>'));
    }
    paint(); return null;
  };

  /* ---- TORCH ---- */
  A.torch = function (mount, phone, st, api) {
    var app = el('div', 'app'); app.style.background = '#000'; var top = el('div', 'app-top', '<h3>🔦 Flashlight</h3>'); app.appendChild(top);
    var body = el('div', 'app-scroll'); body.style.display = 'grid'; body.style.placeItems = 'center';
    var on = false;
    var btn = el('button', 'app-btn primary', 'Turn on'); btn.style.cssText = 'width:130px;height:130px;border-radius:50%;font-size:1rem';
    btn.addEventListener('click', function () { on = !on; btn.textContent = on ? 'Turn off' : 'Turn on'; app.style.background = on ? '#fff7cc' : '#000'; body.style.color = on ? '#333' : '#fff'; });
    body.appendChild(btn); app.appendChild(body); mount.appendChild(app); return null;
  };

  /* ---- COMPASS ---- */
  A.compass = function (mount, phone, st, api) {
    var app = el('div', 'app'); var top = el('div', 'app-top', '<h3>🧭 Compass</h3>'); app.appendChild(top);
    var body = el('div', 'app-scroll'); body.style.display = 'grid'; body.style.placeItems = 'center'; app.appendChild(body); mount.appendChild(app);
    var dial = el('div', null, '<div style="font-size:1.4rem">N</div><div style="font-size:3rem">🧭</div>');
    dial.style.cssText = 'text-align:center;color:#fff;transition:transform .2s';
    var deg = el('div', 'big', '0°'); body.appendChild(dial); body.appendChild(deg);
    var heading = 0, live = false;
    function onOrient(e) { if (e.webkitCompassHeading != null) { heading = e.webkitCompassHeading; live = true; } else if (e.alpha != null) { heading = 360 - e.alpha; live = true; } }
    if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', onOrient, true);
    var iv = setInterval(function () { if (!live) heading = (heading + 7) % 360; dial.style.transform = 'rotate(' + (-heading) + 'deg)'; deg.textContent = Math.round(heading) + '°'; }, 120);
    return function () { clearInterval(iv); window.removeEventListener('deviceorientation', onOrient, true); };
  };

  /* ============================ INIT / EVENTS ============================ */
  function bind() {
    $$('[data-action="scroll-launch"]').forEach(function (b) { b.addEventListener('click', function () { $('#mobileMenu').classList.remove('open'); openLaunch(); }); });
    $('#burger').addEventListener('click', function () { var m = $('#mobileMenu'); var open = m.classList.toggle('open'); $('#burger').setAttribute('aria-expanded', open ? 'true' : 'false'); });
    $$('#mobileMenu a').forEach(function (a) { a.addEventListener('click', function () { $('#mobileMenu').classList.remove('open'); }); });
    $$('.filters .chip').forEach(function (c) { c.addEventListener('click', function () { $$('.filters .chip').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); }); c.classList.add('active'); c.setAttribute('aria-selected', 'true'); activeTier = c.getAttribute('data-tier'); renderCatalog(); }); });
    $('#catalogSearch').addEventListener('input', function (e) { searchQ = e.target.value; renderCatalog(); });
    $('#billHourly').addEventListener('click', function () { billing = 'hourly'; swapBill(); });
    $('#billMonthly').addEventListener('click', function () { billing = 'monthly'; swapBill(); });
    function swapBill() { $('#billHourly').classList.toggle('active', billing === 'hourly'); $('#billMonthly').classList.toggle('active', billing === 'monthly'); renderPricing(); renderCatalog(); }
    $('#launchPlan').addEventListener('change', updateLaunchPrice);
    $('#confirmLaunch').addEventListener('click', confirmLaunch);
    $('#tryDemoBtn').addEventListener('click', function () { openEmu(ensureDemo(), null); });
    $('#emuMirror').addEventListener('change', function (e) { emuLog(e.target.checked ? 'Multi-control broadcast on' : 'Multi-control broadcast off'); });
    $('#emuReboot').addEventListener('click', function () { if (emuId) reboot(emuId); else { osToast('Rebooting…'); if (OS) { OS.booted = false; renderHome(); setTimeout(function () { if (OS) { OS.booted = true; renderHome(); } }, 1500); } } });
    $('#emuStop').addEventListener('click', function () { if (!emuId) { osToast('Demo phone always stays on'); return; } setStatus(emuId, 'stopped'); closeOverlays(); });
    $('#emuShot').addEventListener('click', function () { osToast('Screenshot saved'); emuLog('Screenshot captured'); });
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeOverlays); });
    $$('.overlay').forEach(function (o) { o.addEventListener('click', function (e) { if (e.target === o) closeOverlays(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlays(); });
  }

  function init() {
    save();
    if (!metricsId && fleet.length) metricsId = fleet[0].id;
    renderHeroPhone(); renderCatalog(); renderPricing(); renderFleet(); renderMetricsLabel();
    bind(); tickClocks(); setInterval(tickClocks, 15000);
    setInterval(function () { fleet.forEach(function (p) { if (p.status === 'running') p.uptimeSec += 5; }); }, 5000);
    setInterval(function () {
      var p = metricsId ? inst(metricsId) : fleet[0];
      if (!p || p.status !== 'running') { ['mCpu', 'mMem', 'mNet', 'mBat'].forEach(function (id) { var e = document.getElementById(id); if (e) e.style.width = '0%'; }); return; }
      var t = Date.now() / 1000;
      var cpu = 18 + 14 * Math.abs(Math.sin(t / 3 + p.id.length)) + Math.random() * 8;
      var mem = 52 + 9 * Math.abs(Math.sin(t / 7)) + Math.random() * 4;
      var net = 4 + 9 * Math.abs(Math.sin(t / 2.2)) + Math.random() * 3;
      $('#mCpu').style.width = cpu + '%'; $('#mCpuV').textContent = Math.round(cpu) + '%';
      $('#mMem').style.width = mem + '%'; $('#mMemV').textContent = Math.round(mem) + '%';
      $('#mNet').style.width = Math.min(100, net * 6) + '%'; $('#mNetV').textContent = net.toFixed(1) + ' Mb/s';
      $('#mBat').style.width = '100%'; $('#mBatV').textContent = 'Charging · 100%';
    }, 2000);
    metricLog('Dashboard connected · 8 regions healthy');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
