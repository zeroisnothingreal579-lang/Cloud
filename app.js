/* Stratus Cloud Phones — front-end app (no build, no network deps) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Data ---------- */
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
  var APPS = [
    { id: 'browser', name: 'Browser', icon: '🌐', c: ['#38bdf8', '#6366f1'], home: true },
    { id: 'messages', name: 'Messages', icon: '💬', c: ['#34d399', '#0ea5e9'], home: true, dock: true },
    { id: 'gallery', name: 'Gallery', icon: '🖼️', c: ['#f472b6', '#8b5cf6'], home: true },
    { id: 'camera', name: 'Camera', icon: '📷', c: ['#64748b', '#0f172a'], home: true },
    { id: 'store', name: 'Store', icon: '🛍️', c: ['#fbbf24', '#f97316'], home: true },
    { id: 'settings', name: 'Settings', icon: '⚙️', c: ['#94a3b8', '#475569'], home: true, dock: true },
    { id: 'music', name: 'Music', icon: '🎵', c: ['#a78bfa', '#ec4899'], home: true },
    { id: 'maps', name: 'Maps', icon: '🗺️', c: ['#4ade80', '#0284c7'], home: false, dock: true },
    { id: 'notes', name: 'Notes', icon: '📝', c: ['#fde047', '#f97316'], home: false, dock: true }
  ];
  var STORE_APPS = [
    { name: 'Sky Riders', cat: 'Racing · 84 MB', icon: '🏎️', c: ['#ef4444', '#7c2d12'] },
    { name: 'Pixel Farm 3D', cat: 'Idle · 120 MB', icon: '🚜', c: ['#4ade80', '#166534'] },
    { name: 'ChatWave', cat: 'Social · 45 MB', icon: '🌊', c: ['#38bdf8', '#1e3a8a'] },
    { name: 'BankSecure', cat: 'Finance · 30 MB', icon: '🏦', c: ['#a78bfa', '#312e81'] }
  ];

  /* ---------- State ---------- */
  var LS_KEY = 'stratus-fleet-v1';
  var fleet = load() || seed();
  var billing = 'hourly';
  var activeTier = 'all';
  var searchQ = '';
  var launchDeviceId = 'pixel-9-pro';
  var metricsId = null;
  var emuId = null;

  function load() { try { var v = JSON.parse(localStorage.getItem(LS_KEY)); return Array.isArray(v) ? v : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(fleet)); } catch (e) {} }
  function seed() {
    return [{
      id: 'phone-' + Math.random().toString(36).slice(2, 6),
      name: 'farm-01', deviceId: 'pixel-9-pro', region: 'Frankfurt',
      plan: 'hourly', image: 'Android 15 · GMS', status: 'running',
      createdAt: Date.now() - 1000 * 60 * 42, uptimeSec: 2520,
      extraApps: [], wifi: true, wall: 0
    }];
  }
  function device(id) { for (var i = 0; i < DEVICES.length; i++) if (DEVICES[i].id === id) return DEVICES[i]; return DEVICES[2]; }
  function inst(id) { for (var i = 0; i < fleet.length; i++) if (fleet[i].id === id) return fleet[i]; return null; }
  function money(h) { return '$' + h.toFixed(2); }

  /* ---------- Toasts ---------- */
  function toast(msg) {
    var box = $('#toasts'); var el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg; box.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 300); }, 3200);
  }
  function emuLog(msg) {
    var ul = $('#emuLog'); if (!ul) return;
    var li = document.createElement('li'); li.textContent = new Date().toLocaleTimeString() + ' — ' + msg;
    ul.prepend(li); while (ul.children.length > 12) ul.lastChild.remove();
  }
  function metricLog(msg) {
    var ul = $('#metricLog'); if (!ul) return;
    var li = document.createElement('li'); li.textContent = new Date().toLocaleTimeString() + ' — ' + msg;
    ul.prepend(li); while (ul.children.length > 8) ul.lastChild.remove();
  }

  /* ---------- Clocks ---------- */
  function tickClocks() {
    var t = new Date(); var s = ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2);
    ['heroClock', 'emuClock'].forEach(function (id) { var e = document.getElementById(id); if (e) e.textContent = s; });
    var f = $('#footClock'); if (f) f.textContent = 'Local time ' + t.toLocaleTimeString();
    var h = new Date().getHours();
    var greet = h < 12 ? 'Good morning ☀️' : (h < 18 ? 'Good afternoon ☁️' : 'Good evening 🌙');
    ['emuHello'].forEach(function (id) { var e = document.getElementById(id); if (e) e.textContent = greet; });
  }

  /* ---------- Hero mini phone ---------- */
  function appButton(a) {
    var b = document.createElement('button');
    b.className = 'p-app'; b.setAttribute('data-app', a.id);
    b.innerHTML = '<i style="--c1:' + a.c[0] + ';--c2:' + a.c[1] + '">' + a.icon + '</i><span>' + a.name + '</span>';
    b.addEventListener('click', function () { openEmu(ensureDemo(), a.id); });
    return b;
  }
  function renderHeroPhone() {
    var g = $('#heroGrid'), d = $('#heroDock'); if (!g) return;
    g.innerHTML = ''; d.innerHTML = '';
    APPS.filter(function (a) { return a.home; }).slice(0, 8).forEach(function (a) { g.appendChild(appButton(a)); });
    APPS.filter(function (a) { return a.dock; }).slice(0, 4).forEach(function (a) { d.appendChild(appButton(a)); });
  }

  /* ---------- Catalog ---------- */
  function renderCatalog() {
    var grid = $('#catalogGrid'); if (!grid) return;
    grid.innerHTML = '';
    var list = DEVICES.filter(function (d) {
      var okT = activeTier === 'all' || d.tier === activeTier;
      var q = searchQ.trim().toLowerCase();
      var okQ = !q || (d.name + ' ' + d.chip + ' ' + d.use + ' ' + d.tier).toLowerCase().indexOf(q) !== -1;
      return okT && okQ;
    });
    if (!list.length) { grid.innerHTML = '<div class="empty">No devices match. Try another search or tier.</div>'; return; }
    list.forEach(function (d) {
      var card = document.createElement('article'); card.className = 'device';
      card.innerHTML =
        '<div class="device-top"><span class="tier ' + d.tier + '">' + d.tier + '</span><span class="price">' + money(d.hourly) + ' <small>/hr</small></span></div>' +
        '<h3>' + d.name + '</h3><div class="use">' + d.use + '</div>' +
        '<ul class="specs"><li>⚡ <b>' + d.chip + '</b></li><li>💾 <b>' + d.storage + '</b> private storage</li><li>📡 <b>' + d.display + '</b></li></ul>' +
        '<div class="device-foot"><span class="price">' + money(d.hourly) + ' <small>/hr · $' + d.monthly + '/mo</small></span></div>';
      var row = document.createElement('div'); row.className = 'inst-actions';
      var b1 = document.createElement('button'); b1.className = 'btn btn-primary btn-sm'; b1.textContent = 'Launch';
      b1.addEventListener('click', function () { openLaunch(d.id); });
      var b2 = document.createElement('button'); b2.className = 'btn btn-ghost btn-sm'; b2.textContent = 'Demo';
      b2.addEventListener('click', function () {
        var tmp = { id: 'demo-' + d.id, name: 'demo · ' + d.name, deviceId: d.id, region: ($('#regionPick') || {}).value && $('#regionPick').value !== 'auto' ? $('#regionPick').value : 'Frankfurt', plan: 'hourly', image: 'Android 15 · GMS', status: 'running', createdAt: Date.now(), uptimeSec: 0, extraApps: [], wifi: true, wall: 0, demo: true };
        openEmu(tmp, null);
      });
      row.appendChild(b1); row.appendChild(b2);
      card.appendChild(row);
      grid.appendChild(card);
    });
  }

  /* ---------- Pricing ---------- */
  function renderPricing() {
    var grid = $('#pricingGrid'); if (!grid) return;
    grid.innerHTML = '';
    PLANS.forEach(function (p) {
      var c = document.createElement('div'); c.className = 'price-card' + (p.hot ? ' hot' : '');
      var val = billing === 'hourly' ? money(p.hourly) + ' <small>/hr</small>' : '$' + Math.round(p.monthly * 0.7) + ' <small>/mo</small>';
      c.innerHTML = (p.hot ? '<span class="flag">MOST POPULAR</span>' : '') +
        '<h3>' + p.name + '</h3><div class="big">' + val + '</div><p class="sub">' + p.desc + '</p>' +
        '<ul class="feat"><li>Unlimited streaming</li><li>24/7 always-on uptime</li><li>ADB + REST API access</li><li>Free snapshots (50 GB)</li></ul>';
      var b = document.createElement('button'); b.className = 'btn ' + (p.hot ? 'btn-primary' : 'btn-ghost'); b.textContent = p.cta;
      b.addEventListener('click', function () { openLaunch(p.id === 'studio' ? 'titan-x2-max' : (p.id === 'pro' ? 'pixel-9-pro' : 'nova-lite')); });
      c.appendChild(b); grid.appendChild(c);
    });
  }

  /* ---------- Fleet ---------- */
  function fmtUptime(sec) {
    sec = Math.floor(sec); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + 'h ' : '') + (m ? m + 'm ' : '') + s + 's';
  }
  function renderFleet() {
    var list = $('#fleetList'); if (!list) return;
    list.innerHTML = '';
    if (!fleet.length) {
      list.innerHTML = '<div class="fleet-empty"><h3>No phones yet</h3><p>Launch your first cloud phone — the first 2 hours are free.</p></div>';
      return;
    }
    fleet.forEach(function (p) {
      var d = device(p.deviceId);
      var el = document.createElement('div'); el.className = 'instance';
      var age = Math.max(1, Math.round((Date.now() - p.createdAt) / 1000));
      var pct = p.status === 'running' ? Math.min(99, 8 + (age % 80)) : (p.status === 'provisioning' ? 45 : 0);
      el.innerHTML =
        '<div class="inst-head"><h3>' + esc(p.name) + '</h3><span class="status ' + p.status + '">' + p.status + '</span>' +
        '<span class="tier ' + d.tier + '">' + d.name + '</span></div>' +
        '<p class="inst-meta"><b>' + p.region + '</b> · ' + p.image + ' · ' + (p.plan === 'monthly' ? 'monthly' : money(d.hourly) + '/hr') +
        ' · uptime <b>' + fmtUptime(p.uptimeSec) + '</b> · ' + (p.extraApps.length || 0) + ' apps installed</p>' +
        '<div class="inst-bar"><i style="width:' + pct + '%"></i></div>';
      var row = document.createElement('div'); row.className = 'inst-actions';
      function btn(label, cls, fn, dis) {
        var b = document.createElement('button'); b.className = 'btn ' + cls + ' btn-sm'; b.textContent = label; if (dis) b.disabled = true;
        b.addEventListener('click', fn); row.appendChild(b); return b;
      }
      if (p.status === 'running') {
        btn('Open phone', 'btn-primary', function () { openEmu(p, null); });
        btn('Metrics', 'btn-ghost', function () { metricsId = p.id; renderMetricsLabel(); metricLog('Attached to ' + p.name); });
        btn('Reboot', 'btn-ghost', function () { reboot(p.id); });
        btn('Stop', 'btn-ghost', function () { setStatus(p.id, 'stopped'); });
      } else if (p.status === 'provisioning') {
        btn('Booting…', 'btn-ghost', function () {}, true);
      } else {
        btn('Start', 'btn-primary', function () { reboot(p.id); });
        btn('Open (offline)', 'btn-ghost', function () { openEmu(p, null); });
      }
      btn('Terminate', 'btn-danger', function () { terminate(p.id); });
      el.appendChild(row); list.appendChild(el);
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function setStatus(id, st) {
    var p = inst(id); if (!p) return;
    p.status = st; save(); renderFleet();
    metricLog(p.name + ' → ' + st);
    if (emuId === id) syncEmu(p);
  }
  function reboot(id) {
    var p = inst(id); if (!p) return;
    setStatus(id, 'provisioning'); toast('Rebooting ' + p.name + '…');
    setTimeout(function () { p.uptimeSec = 0; p.createdAt = Date.now(); setStatus(id, 'running'); toast(p.name + ' is back online'); }, 2600);
  }
  function terminate(id) {
    var p = inst(id); if (!p) return;
    if (!confirm('Terminate ' + p.name + '? Its snapshot is kept for 30 days.')) return;
    fleet = fleet.filter(function (x) { return x.id !== id; });
    if (metricsId === id) metricsId = fleet.length ? fleet[0].id : null;
    save(); renderFleet(); renderMetricsLabel(); toast(p.name + ' terminated');
  }

  /* ---------- Launch modal ---------- */
  function openLaunch(devId) {
    if (devId) launchDeviceId = devId;
    renderLaunchDevices(); updateLaunchPrice();
    openOverlay('#launchOverlay');
  }
  function renderLaunchDevices() {
    var box = $('#launchDevices'); if (!box) return; box.innerHTML = '';
    DEVICES.forEach(function (d) {
      var el = document.createElement('div'); el.className = 'pick' + (d.id === launchDeviceId ? ' sel' : '');
      el.innerHTML = '<div><b>' + d.name + ' · ' + d.chip + '</b><span>' + d.use + '</span></div><strong>' + money(d.hourly) + '/h</strong>';
      el.addEventListener('click', function () { launchDeviceId = d.id; renderLaunchDevices(); updateLaunchPrice(); });
      box.appendChild(el);
    });
    $('#launchSub').textContent = 'Configure your instance. Provisioning takes ~30 seconds.';
  }
  function updateLaunchPrice() {
    var d = device(launchDeviceId); var plan = $('#launchPlan').value;
    $('#launchPrice').textContent = plan === 'monthly' ? '$' + Math.round(d.monthly * 0.7) + '/mo' : money(d.hourly) + '/hr';
  }
  function confirmLaunch() {
    var d = device(launchDeviceId);
    var region = $('#launchRegion').value, plan = $('#launchPlan').value, image = $('#launchImage').value;
    var name = ($('#launchName').value || '').trim() || (d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 4));
    var p = { id: 'phone-' + Math.random().toString(36).slice(2, 6), name: name, deviceId: d.id, region: region, plan: plan, image: image, status: 'provisioning', createdAt: Date.now(), uptimeSec: 0, extraApps: [], wifi: true, wall: 0 };
    fleet.unshift(p); metricsId = p.id; save(); renderFleet(); renderMetricsLabel();
    closeOverlays(); toast('Provisioning ' + name + ' (' + d.name + ' · ' + region + ')…');
    metricLog('Provisioning ' + name + '…');
    setTimeout(function () { p.status = 'running'; save(); renderFleet(); toast(name + ' is online — tap Open phone'); metricLog(name + ' online · 34ms RTT'); openEmu(p, null); }, 2800);
  }

  /* ---------- Overlays ---------- */
  function openOverlay(sel) { var o = $(sel); if (o) { o.classList.add('open'); o.setAttribute('aria-hidden', 'false'); } }
  function closeOverlays() { $$('.overlay').forEach(function (o) { o.classList.remove('open'); o.setAttribute('aria-hidden', 'true'); }); }

  /* ---------- Emulator ---------- */
  function ensureDemo() {
    var running = null;
    for (var i = 0; i < fleet.length; i++) if (fleet[i].status === 'running') running = fleet[i];
    if (running) return running;
    var p = { id: 'demo-live', name: 'demo · Pixel 9 Pro', deviceId: 'pixel-9-pro', region: 'Frankfurt', plan: 'hourly', image: 'Android 15 · GMS', status: 'running', createdAt: Date.now(), uptimeSec: 0, extraApps: [], wifi: true, wall: 0, demo: true };
    return p;
  }
  function openEmu(p, startApp) {
    emuId = p.demo ? null : p.id;
    if (!p.demo && !inst(p.id)) { toast('Phone no longer exists'); return; }
    var target = p.demo ? p : inst(p.id);
    var d = device(target.deviceId);
    $('#emuTitle').textContent = target.name;
    $('#emuSub').textContent = d.name + ' · ' + target.region + ' · ' + target.plan;
    openOverlay('#emuOverlay');
    syncEmu(target);
    if (startApp) openApp(startApp, target); else showHome();
    emuLog('Connected to ' + target.name + ' (' + target.region + ', 34ms)');
  }
  function walls() {
    return [
      'linear-gradient(165deg,#1e1b4b,#312e81 40%,#0e7490 100%)',
      'linear-gradient(165deg,#4c1d95,#be185d 55%,#f59e0b 110%)',
      'linear-gradient(165deg,#052e16,#047857 55%,#22d3ee 120%)'
    ];
  }
  function syncEmu(p) {
    var boot = $('#emuBoot'); var running = p.status === 'running';
    boot.hidden = running;
    $('#emuNet').textContent = p.wifi ? '5G ▂▄▆ ●' : '5G ▁ ⋯ ○';
    $('#emuScreen').style.background = walls()[p.wall || 0];
    $('#emuScreen').style.backgroundSize = 'cover';
    renderEmuHome(p);
  }
  function renderEmuHome(p) {
    var g = $('#emuGrid'), d = $('#emuDock'); if (!g) return;
    g.innerHTML = ''; d.innerHTML = '';
    var apps = APPS.filter(function (a) { return a.home; }).concat(p.extraApps.map(function (n) {
      return { id: 'x-' + n, name: n, icon: '📦', c: ['#6366f1', '#22d3ee'] };
    }));
    apps.slice(0, 8).forEach(function (a) {
      var b = document.createElement('button'); b.className = 'p-app';
      b.innerHTML = '<i style="--c1:' + a.c[0] + ';--c2:' + a.c[1] + '">' + a.icon + '</i><span>' + esc(a.name) + '</span>';
      b.addEventListener('click', function () { openApp(a.id, p, a.name); });
      g.appendChild(b);
    });
    APPS.filter(function (a) { return a.dock; }).slice(0, 4).forEach(function (a) {
      var b2 = document.createElement('button'); b2.className = 'p-app';
      b2.innerHTML = '<i style="--c1:' + a.c[0] + ';--c2:' + a.c[1] + '">' + a.icon + '</i><span>' + a.name + '</span>';
      b2.addEventListener('click', function () { openApp(a.id, p, a.name); });
      d.appendChild(b2);
    });
  }
  function showHome() { $('#emuApp').hidden = true; $('#emuHome').hidden = false; }
  function emuSay(msg) {
    var t = $('#emuToast'); t.textContent = msg; t.hidden = false;
    clearTimeout(t._h); t._h = setTimeout(function () { t.hidden = true; }, 1800);
  }
  function openApp(id, p, label) {
    if (p.status !== 'running') { emuSay('Phone is ' + p.status + ' — start it first'); return; }
    var body = $('#emuAppBody'), title = $('#emuAppTitle');
    $('#emuHome').hidden = true; $('#emuApp').hidden = false;
    if ($('#emuMirror').checked && emuId) metricLog('Touch broadcast → fleet (' + (label || id) + ')');
    if (id === 'messages') {
      title.textContent = 'Messages';
      body.innerHTML = '<div class="msg" id="msgList"><div class="bubble">Welcome to your cloud phone ☁️ Send a message to test the demo.</div></div><div class="msg-row"><input id="msgIn" placeholder="Type a message…" /><button id="msgSend">Send</button></div>';
      $('#msgSend').addEventListener('click', send);
      $('#msgIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
      function send() {
        var v = $('#msgIn').value.trim(); if (!v) return;
        var m = document.createElement('div'); m.className = 'bubble me'; m.textContent = v;
        $('#msgList').appendChild(m); $('#msgIn').value = '';
        setTimeout(function () {
          var r = document.createElement('div'); r.className = 'bubble';
          r.textContent = 'Delivered from the cloud in 34ms ✓✓ (demo reply)';
          $('#msgList').appendChild(r); body.scrollTop = body.scrollHeight;
        }, 900);
      }
    } else if (id === 'browser') {
      title.textContent = 'Browser';
      body.innerHTML = '<div class="browser-bar"><input id="bUrl" value="stratus.cloud/phones" /><button class="msg-row button" id="bGo" style="background:#6366f1;border:none;color:#fff;border-radius:10px;padding:7px 12px;cursor:pointer;font-weight:700">Go</button></div><div class="browser-page" id="bPage"></div>';
      function render() {
        $('#bPage').innerHTML = '<h4>' + esc($('#bUrl').value || 'stratus.cloud') + '</h4><p>Rendered <b>in the cloud</b> at 60fps and streamed to this window. Your tabs stay open even when you disconnect — this demo page is simulated locally.</p><p style="background:#eef2ff;border-radius:8px;padding:8px">⚡ ' + device(p.deviceId).name + ' · ' + p.region + ' · 34ms RTT</p>';
      }
      $('#bGo').addEventListener('click', render); render();
    } else if (id === 'store') {
      title.textContent = 'Store';
      body.innerHTML = '';
      STORE_APPS.forEach(function (s) {
        var row = document.createElement('div'); row.className = 'store-app';
        var has = p.extraApps.indexOf(s.name) !== -1;
        row.innerHTML = '<i style="background:linear-gradient(135deg,' + s.c[0] + ',' + s.c[1] + ')">' + s.icon + '</i><div><b>' + s.name + '</b><span>' + s.cat + '</span></div>';
        var b = document.createElement('button'); b.textContent = has ? 'Open' : 'Get';
        b.addEventListener('click', function () {
          if (p.extraApps.indexOf(s.name) === -1) {
            b.textContent = '…'; setTimeout(function () {
              p.extraApps.push(s.name);
              if (!p.demo) { save(); renderFleet(); }
              b.textContent = 'Open'; renderEmuHome(p); emuSay(s.name + ' installed ✓'); emuLog('Installed ' + s.name);
            }, 1200);
          } else openApp('x-' + s.name, p, s.name);
        });
        row.appendChild(b); body.appendChild(row);
      });
    } else if (id === 'settings') {
      title.textContent = 'Settings';
      body.innerHTML = '';
      var rows = [
        { k: 'Wi-Fi / 5G', v: p.wifi ? 'Connected · 34ms' : 'Off', t: 'toggle-wifi' },
        { k: 'Wallpaper', v: 'Theme ' + ((p.wall || 0) + 1) + ' of 3', t: 'wall' },
        { k: 'Device', v: device(p.deviceId).name, t: null },
        { k: 'Region', v: p.region, t: null },
        { k: 'Android', v: p.image, t: null }
      ];
      rows.forEach(function (r) {
        var el = document.createElement('div'); el.className = 'set-row';
        el.innerHTML = '<span>' + r.k + '<br /><small style="color:var(--mut)">' + r.v + '</small></span>';
        if (r.t === 'toggle-wifi') {
          var b = document.createElement('button'); b.className = 'btn btn-ghost btn-sm'; b.textContent = p.wifi ? 'Turn off' : 'Turn on';
          b.addEventListener('click', function () { p.wifi = !p.wifi; if (!p.demo) save(); syncEmu(p); openApp('settings', p); emuSay('Wi-Fi ' + (p.wifi ? 'connected' : 'off')); });
          el.appendChild(b);
        } else if (r.t === 'wall') {
          var b2 = document.createElement('button'); b2.className = 'btn btn-ghost btn-sm'; b2.textContent = 'Next';
          b2.addEventListener('click', function () { p.wall = ((p.wall || 0) + 1) % 3; if (!p.demo) save(); syncEmu(p); openApp('settings', p); });
          el.appendChild(b2);
        }
        body.appendChild(el);
      });
    } else if (id === 'gallery') {
      title.textContent = 'Gallery';
      var pal = ['#f472b6,#8b5cf6', '#34d399,#0ea5e9', '#fbbf24,#ef4444', '#38bdf8,#6366f1', '#a78bfa,#4c1d95', '#4ade80,#166534'];
      body.innerHTML = '<div class="gallery">' + pal.map(function (g) { return '<div style="background:linear-gradient(135deg,' + g + ')"></div>'; }).join('') + '</div><p style="color:var(--mut)">6 cloud photos synced from Frankfurt storage.</p>';
    } else if (id === 'camera') {
      title.textContent = 'Camera';
      body.innerHTML = '<div style="background:linear-gradient(135deg,#0f172a,#334155);border-radius:12px;min-height:220px;display:grid;place-items:center;font-size:3rem">📷</div><p style="color:var(--mut)">Virtual camera · point it at any app for screenshots.</p><button class="btn btn-primary btn-sm" id="camShot">Capture photo</button>';
      $('#camShot').addEventListener('click', function () { emuSay('Photo saved to Gallery ✓'); emuLog('Camera capture saved'); });
    } else if (id === 'music') {
      title.textContent = 'Music';
      body.innerHTML = '<div class="store-app"><i style="background:linear-gradient(135deg,#a78bfa,#ec4899)">🎵</i><div><b>Lo-Fi Cloud Mix</b><span>Streaming · 128 kbps</span></div><button id="playB">Play</button></div><div class="meter"><i id="playM" style="width:0%"></i></div>';
      var playing = false;
      $('#playB').addEventListener('click', function () {
        playing = !playing; $('#playB').textContent = playing ? 'Pause' : 'Play';
        $('#playM').style.width = playing ? '72%' : '0%'; emuSay(playing ? 'Now playing ♪' : 'Paused');
      });
    } else {
      title.textContent = label || 'App';
      body.innerHTML = '<div style="text-align:center;padding:40px 10px"><div style="font-size:3rem">📦</div><h4 style="margin:10px 0 4px">' + esc(label || 'App') + '</h4><p style="color:var(--mut)">This app is running on your cloud phone.<br />Everything here is an interactive demo.</p></div>';
    }
  }

  /* ---------- Metrics loop ---------- */
  function renderMetricsLabel() {
    var p = metricsId ? inst(metricsId) : fleet[0];
    if (!p) { $('#metricsTarget').textContent = 'no phones'; return; }
    metricsId = p.id;
    $('#metricsTarget').textContent = p.name;
  }
  function tickMetrics() {
    var p = metricsId ? inst(metricsId) : fleet[0];
    if (!p || p.status !== 'running') {
      ['mCpu', 'mMem', 'mNet', 'mBat'].forEach(function (id) { var e = document.getElementById(id); if (e) e.style.width = '0%'; });
      return;
    }
    var t = Date.now() / 1000;
    var cpu = 18 + 14 * Math.abs(Math.sin(t / 3 + p.id.length)) + Math.random() * 8;
    var mem = 52 + 9 * Math.abs(Math.sin(t / 7)) + Math.random() * 4;
    var net = 4 + 9 * Math.abs(Math.sin(t / 2.2)) + Math.random() * 3;
    $('#mCpu').style.width = cpu + '%'; $('#mCpuV').textContent = Math.round(cpu) + '%';
    $('#mMem').style.width = mem + '%'; $('#mMemV').textContent = Math.round(mem) + '%';
    $('#mNet').style.width = Math.min(100, net * 6) + '%'; $('#mNetV').textContent = net.toFixed(1) + ' Mb/s';
    $('#mBat').style.width = '100%'; $('#mBatV').textContent = 'Charging · 100%';
    p.uptimeSec += 2;
  }
  /* ---------- Events ---------- */
  function bind() {
    $$('[data-action="scroll-launch"]').forEach(function (b) {
      b.addEventListener('click', function () { $('#mobileMenu').classList.remove('open'); openLaunch(); });
    });
    $('#burger').addEventListener('click', function () {
      var m = $('#mobileMenu'); var open = m.classList.toggle('open');
      $('#burger').setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#mobileMenu a').forEach(function (a) { a.addEventListener('click', function () { $('#mobileMenu').classList.remove('open'); }); });
    $$('.filters .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.filters .chip').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
        c.classList.add('active'); c.setAttribute('aria-selected', 'true');
        activeTier = c.getAttribute('data-tier'); renderCatalog();
      });
    });
    $('#catalogSearch').addEventListener('input', function (e) { searchQ = e.target.value; renderCatalog(); });
    $('#billHourly').addEventListener('click', function () { billing = 'hourly'; swapBill(); });
    $('#billMonthly').addEventListener('click', function () { billing = 'monthly'; swapBill(); });
    function swapBill() {
      $('#billHourly').classList.toggle('active', billing === 'hourly');
      $('#billMonthly').classList.toggle('active', billing === 'monthly');
      renderPricing(); renderCatalog();
    }
    $('#launchPlan').addEventListener('change', updateLaunchPrice);
    $('#confirmLaunch').addEventListener('click', confirmLaunch);
    $('#tryDemoBtn').addEventListener('click', function () { openEmu(ensureDemo(), null); });
    $('#emuBack').addEventListener('click', showHome);
    $('#emuReboot').addEventListener('click', function () {
      if (!emuId) { $('#emuBoot').hidden = false; setTimeout(function () { $('#emuBoot').hidden = true; emuSay('Rebooted ✓'); }, 1800); return; }
      reboot(emuId);
    });
    $('#emuStop').addEventListener('click', function () {
      if (!emuId) { emuSay('Demo phone always stays on ✓'); return; }
      setStatus(emuId, 'stopped'); closeOverlays();
    });
    $('#emuShot').addEventListener('click', function () { emuSay('Screenshot saved ✓'); emuLog('Screenshot captured (demo)'); });
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeOverlays); });
    $$('.overlay').forEach(function (o) { o.addEventListener('click', function (e) { if (e.target === o) closeOverlays(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlays(); });
  }

  /* ---------- Init ---------- */
  function init() {
    save();
    if (!metricsId && fleet.length) metricsId = fleet[0].id;
    renderHeroPhone(); renderCatalog(); renderPricing(); renderFleet(); renderMetricsLabel();
    bind(); tickClocks();
    setInterval(tickClocks, 15000);
    setInterval(tickMetrics, 2000);
    setInterval(function () { fleet.forEach(function (p) { if (p.status === 'running') p.uptimeSec += 5; }); }, 5000);
    setInterval(function () {
      if (!document.hidden && fleet.some(function (p) { return p.status === 'running'; })) { /* keep DOM fresh every 30s */ }
    }, 30000);
    metricLog('Dashboard connected · 8 regions healthy');
    tickMetrics();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
