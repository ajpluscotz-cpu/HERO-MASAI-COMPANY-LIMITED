/* =========================================================
   HMC ADMIN — dashboard.js
   Mfumo kamili wa client-side (localStorage)
   ========================================================= */

// ---- Linda ukurasa: lazima uwe umeingia ----
if (sessionStorage.getItem("hmc_logged_in") !== "1") {
  window.location.href = "login.html";
}

// ---- Vifunguo vya storage ----
var DB = {
  settings: "hmc_settings",
  account: "hmc_admin_account",
  clients: "hmc_clients",
  projects: "hmc_projects",
  docs: "hmc_docs",
  expenses: "hmc_expenses"
};

// ---- Visaidizi ----
function load(key, def) {
  try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; }
  catch (e) { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
function money(n) {
  var cur = getSettings().currency || "TZS";
  return cur + " " + Number(n || 0).toLocaleString("en-US");
}
function today() { return new Date().toISOString().slice(0, 10); }
function fmtDate(d) {
  if (!d) return "";
  var p = d.split("-");
  return p.length === 3 ? (p[2] + "/" + p[1] + "/" + p[0]) : d;
}

// ---- Settings chaguo-msingi ----
function getSettings() {
  return load(DB.settings, {
    name: "HERO MASAI COMPANY LTD",
    phone: "0754 769 757",
    email: "",
    address: "Dar es Salaam, Tanzania",
    tin: "",
    currency: "TZS",
    bank: "",
    vat: "no",
    vatrate: 18,
    footer: "Asante kwa kufanya kazi na Hero Masai Company Ltd."
  });
}

// =========================================================
//  URAMBAZAJI (TABS)
// =========================================================
var titles = {
  dashboard: "Dashboard", clients: "Wateja", projects: "Miradi",
  invoice: "Invoice", quotation: "Quotation", receipt: "Receipt",
  expenses: "Matumizi", reports: "Ripoti", settings: "Settings"
};
document.getElementById("nav").addEventListener("click", function (e) {
  var btn = e.target.closest("button"); if (!btn) return;
  var tab = btn.dataset.tab;
  document.querySelectorAll(".sb-nav button").forEach(function (b) { b.classList.remove("active"); });
  btn.classList.add("active");
  document.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("active"); });
  document.getElementById("tab-" + tab).classList.add("active");
  document.getElementById("page-title").textContent = titles[tab];
  refresh(tab);
});

document.getElementById("logout").addEventListener("click", function () {
  sessionStorage.removeItem("hmc_logged_in");
  window.location.href = "login.html";
});

// =========================================================
//  WATEJA
// =========================================================
function renderClients() {
  var list = load(DB.clients, []);
  var el = document.getElementById("clients-list");
  if (!list.length) { el.innerHTML = '<p class="empty">Bado hakuna wateja.</p>'; return; }
  el.innerHTML = list.map(function (c) {
    return '<div class="rec"><div class="meta"><b>' + esc(c.name) + '</b>' +
      '<span>' + esc(c.phone || "-") + (c.address ? " &middot; " + esc(c.address) : "") + '</span></div>' +
      '<button class="btn btn-sm" style="background:#fdeceb;color:var(--red)" onclick="delClient(\'' + c.id + '\')">Futa</button></div>';
  }).join("");
}
window.delClient = function (id) {
  if (!confirm("Futa mteja huyu?")) return;
  save(DB.clients, load(DB.clients, []).filter(function (c) { return c.id !== id; }));
  renderClients(); fillClientSelects();
};
document.getElementById("c-save").addEventListener("click", function () {
  var name = document.getElementById("c-name").value.trim();
  if (!name) { alert("Weka jina la mteja."); return; }
  var list = load(DB.clients, []);
  list.push({
    id: uid(), name: name,
    phone: document.getElementById("c-phone").value.trim(),
    email: document.getElementById("c-email").value.trim(),
    address: document.getElementById("c-address").value.trim()
  });
  save(DB.clients, list);
  ["c-name", "c-phone", "c-email", "c-address"].forEach(function (i) { document.getElementById(i).value = ""; });
  renderClients(); fillClientSelects();
});

function fillClientSelects() {
  var list = load(DB.clients, []);
  var opts = '<option value="">— Chagua mteja —</option>' +
    list.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join("");
  ["p-client"].forEach(function (id) {
    var s = document.getElementById(id); if (s) s.innerHTML = opts;
  });
}

// =========================================================
//  MIRADI
// =========================================================
function renderProjects() {
  var list = load(DB.projects, []);
  var clients = load(DB.clients, []);
  var el = document.getElementById("projects-list");
  if (!list.length) { el.innerHTML = '<p class="empty">Bado hakuna miradi.</p>'; return; }
  var colors = { "Inasubiri": "#6b7280", "Inaendelea": "#16335c", "Imekamilika": "#1f9e4d", "Imesimama": "#c8262f" };
  el.innerHTML = list.map(function (p) {
    var c = clients.filter(function (x) { return x.id === p.clientId; })[0];
    return '<div class="rec"><div class="meta"><b>' + esc(p.title) + '</b>' +
      '<span>' + (c ? esc(c.name) : "—") + (p.location ? " &middot; " + esc(p.location) : "") + '</span></div>' +
      '<div style="text-align:right">' +
      '<span class="badge" style="background:' + colors[p.status] + '22;color:' + colors[p.status] + '">' + esc(p.status) + '</span>' +
      (p.budget ? '<div class="amt" style="font-size:.9rem">' + money(p.budget) + '</div>' : '') + '</div>' +
      '<button class="btn btn-sm" style="background:#fdeceb;color:var(--red)" onclick="delProject(\'' + p.id + '\')">Futa</button></div>';
  }).join("");
}
window.delProject = function (id) {
  if (!confirm("Futa mradi huu?")) return;
  save(DB.projects, load(DB.projects, []).filter(function (p) { return p.id !== id; }));
  renderProjects();
};
document.getElementById("p-save").addEventListener("click", function () {
  var title = document.getElementById("p-title").value.trim();
  if (!title) { alert("Weka jina la mradi."); return; }
  var list = load(DB.projects, []);
  list.push({
    id: uid(), title: title,
    clientId: document.getElementById("p-client").value,
    location: document.getElementById("p-location").value.trim(),
    budget: Number(document.getElementById("p-budget").value || 0),
    status: document.getElementById("p-status").value,
    note: document.getElementById("p-note").value.trim()
  });
  save(DB.projects, list);
  ["p-title", "p-location", "p-budget", "p-note"].forEach(function (i) { document.getElementById(i).value = ""; });
  renderProjects();
});

// =========================================================
//  NYARAKA: INVOICE / QUOTATION / RECEIPT (builder wa pamoja)
// =========================================================
var DOC_META = {
  invoice: { title: "Invoice", prefix: "INV", swahili: "Ankara (Invoice)", showBank: true, showPaid: false },
  quotation: { title: "Quotation", prefix: "QUO", swahili: "Nukuu ya Bei (Quotation)", showBank: false, showPaid: false },
  receipt: { title: "Receipt", prefix: "RCT", swahili: "Risiti (Receipt)", showBank: false, showPaid: true }
};

function nextNumber(type) {
  var meta = DOC_META[type];
  var year = new Date().getFullYear();
  var docs = load(DB.docs, []);
  var count = docs.filter(function (d) { return d.type === type; }).length + 1;
  return meta.prefix + "-" + year + "-" + String(count).padStart(3, "0");
}

function buildDocPanel(type) {
  var meta = DOC_META[type];
  var panel = document.getElementById("tab-" + type);
  panel.innerHTML =
    '<div class="grid2">' +
    '<div class="box">' +
    '<p class="eyebrow">Tengeneza ' + meta.title + '</p>' +
    '<h2>' + meta.swahili + '</h2>' +
    '<div class="row">' +
    '<div><label>Namba</label><input id="' + type + '-number" readonly></div>' +
    '<div><label>Tarehe</label><input id="' + type + '-date" type="date"></div>' +
    '</div>' +
    '<label>Mteja (au andika mwenyewe)</label>' +
    '<select id="' + type + '-clientsel"></select>' +
    '<div class="row">' +
    '<div><label>Jina la Mteja</label><input id="' + type + '-cname"></div>' +
    '<div><label>Simu ya Mteja</label><input id="' + type + '-cphone"></div>' +
    '</div>' +
    '<label>Bidhaa / Huduma</label>' +
    '<table class="items"><thead><tr><th style="width:48%">Maelezo</th><th>Idadi</th><th>Bei (moja)</th><th></th></tr></thead>' +
    '<tbody id="' + type + '-items"></tbody></table>' +
    '<button class="btn btn-outline btn-sm" id="' + type + '-additem">+ Ongeza Mstari</button>' +
    (meta.showPaid ? '<div style="margin-top:14px"><label>Njia ya Malipo</label><select id="' + type + '-method"><option>Cash</option><option>M-Pesa</option><option>Tigo Pesa</option><option>Airtel Money</option><option>Benki</option></select></div>' : '') +
    '<label style="margin-top:14px">Maelezo ya ziada</label><textarea id="' + type + '-note" rows="2"></textarea>' +
    '<div class="totals" id="' + type + '-totals"></div>' +
    '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-primary" id="' + type + '-save">Hifadhi & Chapisha</button>' +
    '<button class="btn btn-outline" id="' + type + '-preview">Onyesha</button>' +
    '</div>' +
    '</div>' +
    '<div class="box">' +
    '<h2>' + meta.title + ' Zilizohifadhiwa</h2>' +
    '<div id="' + type + '-history"></div>' +
    '</div>' +
    '</div>';

  // jaza select ya wateja
  var clients = load(DB.clients, []);
  document.getElementById(type + "-clientsel").innerHTML =
    '<option value="">— Chagua mteja aliyehifadhiwa —</option>' +
    clients.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join("");

  document.getElementById(type + "-clientsel").addEventListener("change", function () {
    var c = clients.filter(function (x) { return x.id === this.value; }.bind(this))[0];
    if (c) {
      document.getElementById(type + "-cname").value = c.name;
      document.getElementById(type + "-cphone").value = c.phone || "";
    }
  });

  document.getElementById(type + "-number").value = nextNumber(type);
  document.getElementById(type + "-date").value = today();
  addItemRow(type);

  document.getElementById(type + "-additem").addEventListener("click", function () { addItemRow(type); });
  document.getElementById(type + "-save").addEventListener("click", function () { saveDoc(type); });
  document.getElementById(type + "-preview").addEventListener("click", function () {
    var d = collectDoc(type); if (d) { renderPrint(d); window.print(); }
  });

  recalc(type);
  renderHistory(type);
}

function addItemRow(type) {
  var tb = document.getElementById(type + "-items");
  var tr = document.createElement("tr");
  tr.innerHTML =
    '<td><input class="it-desc" placeholder="Maelezo"></td>' +
    '<td><input class="it-qty" type="number" value="1" min="0"></td>' +
    '<td><input class="it-price" type="number" value="0" min="0"></td>' +
    '<td class="del"><button title="Ondoa">&times;</button></td>';
  tb.appendChild(tr);
  tr.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", function () { recalc(type); }); });
  tr.querySelector(".del button").addEventListener("click", function () { tr.remove(); recalc(type); });
}

function collectItems(type) {
  var rows = document.querySelectorAll("#" + type + "-items tr");
  var items = [];
  rows.forEach(function (r) {
    var desc = r.querySelector(".it-desc").value.trim();
    var qty = Number(r.querySelector(".it-qty").value || 0);
    var price = Number(r.querySelector(".it-price").value || 0);
    if (desc) items.push({ desc: desc, qty: qty, price: price });
  });
  return items;
}

function recalc(type) {
  var s = getSettings();
  var items = collectItems(type);
  var sub = items.reduce(function (a, b) { return a + b.qty * b.price; }, 0);
  var vat = s.vat === "yes" ? Math.round(sub * (Number(s.vatrate) || 0) / 100) : 0;
  var total = sub + vat;
  var html = '<div class="line"><span>Jumla ndogo</span><span>' + money(sub) + '</span></div>';
  if (s.vat === "yes") html += '<div class="line"><span>VAT (' + s.vatrate + '%)</span><span>' + money(vat) + '</span></div>';
  html += '<div class="line grand"><span>JUMLA</span><span>' + money(total) + '</span></div>';
  document.getElementById(type + "-totals").innerHTML = html;
  return { sub: sub, vat: vat, total: total };
}

function collectDoc(type) {
  var items = collectItems(type);
  if (!items.length) { alert("Ongeza angalau bidhaa/huduma moja."); return null; }
  var name = document.getElementById(type + "-cname").value.trim();
  if (!name) { alert("Weka jina la mteja."); return null; }
  var t = recalc(type);
  var methodEl = document.getElementById(type + "-method");
  return {
    id: uid(), type: type,
    number: document.getElementById(type + "-number").value,
    date: document.getElementById(type + "-date").value,
    clientName: name,
    clientPhone: document.getElementById(type + "-cphone").value.trim(),
    items: items, subtotal: t.sub, vat: t.vat, total: t.total,
    method: methodEl ? methodEl.value : "",
    note: document.getElementById(type + "-note").value.trim(),
    status: type === "receipt" ? "Imelipwa" : (type === "invoice" ? "Haijalipwa" : "—")
  };
}

function saveDoc(type) {
  var d = collectDoc(type); if (!d) return;
  var docs = load(DB.docs, []);
  docs.unshift(d);
  save(DB.docs, docs);
  renderPrint(d);
  window.print();
  // weka upya fomu
  buildDocPanel(type);
}

window.delDoc = function (id, type) {
  if (!confirm("Futa nyaraka hii?")) return;
  save(DB.docs, load(DB.docs, []).filter(function (d) { return d.id !== id; }));
  renderHistory(type);
};
window.printDoc = function (id) {
  var d = load(DB.docs, []).filter(function (x) { return x.id === id; })[0];
  if (d) { renderPrint(d); window.print(); }
};
window.toggleInvoicePaid = function (id, type) {
  var docs = load(DB.docs, []);
  docs.forEach(function (d) { if (d.id === id) d.status = d.status === "Imelipwa" ? "Haijalipwa" : "Imelipwa"; });
  save(DB.docs, docs); renderHistory(type);
};

function renderHistory(type) {
  var el = document.getElementById(type + "-history");
  var docs = load(DB.docs, []).filter(function (d) { return d.type === type; });
  if (!docs.length) { el.innerHTML = '<p class="empty">Bado hakuna.</p>'; return; }
  el.innerHTML = docs.map(function (d) {
    var paidBtn = type === "invoice"
      ? '<button class="btn btn-sm" style="background:' + (d.status === "Imelipwa" ? "#e3f6e9;color:var(--green)" : "#fff7d6;color:#9a7d00") + '" onclick="toggleInvoicePaid(\'' + d.id + '\',\'' + type + '\')">' + esc(d.status) + '</button>'
      : '';
    return '<div class="rec"><div class="meta"><b>' + esc(d.number) + '</b>' +
      '<span>' + esc(d.clientName) + ' &middot; ' + fmtDate(d.date) + '</span></div>' +
      '<div class="amt">' + money(d.total) + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + paidBtn +
      '<button class="btn btn-sm btn-navy" onclick="printDoc(\'' + d.id + '\')">Chapisha</button>' +
      '<button class="btn btn-sm" style="background:#fdeceb;color:var(--red)" onclick="delDoc(\'' + d.id + '\',\'' + type + '\')">Futa</button>' +
      '</div></div>';
  }).join("");
}

// ---- Print render ----
function renderPrint(d) {
  var s = getSettings();
  var meta = DOC_META[d.type];
  var rows = d.items.map(function (it) {
    return '<tr><td>' + esc(it.desc) + '</td><td class="r">' + it.qty + '</td>' +
      '<td class="r">' + money(it.price) + '</td><td class="r">' + money(it.qty * it.price) + '</td></tr>';
  }).join("");
  var totals = '<div class="line"><span>Jumla ndogo</span><span>' + money(d.subtotal) + '</span></div>';
  if (d.vat > 0) totals += '<div class="line"><span>VAT (' + s.vatrate + '%)</span><span>' + money(d.vat) + '</span></div>';
  totals += '<div class="line grand"><span>JUMLA</span><span>' + money(d.total) + '</span></div>';

  document.getElementById("print-area").innerHTML =
    '<div class="doc">' +
    '<div class="doc-head">' +
    '<div style="display:flex;gap:14px;align-items:center">' +
    '<img src="../assets/logo.jpg" alt="HMC">' +
    '<div class="doc-co"><b>' + esc(s.name) + '</b>' +
    '<span>' + esc(s.address) + '</span>' +
    '<span>Simu: ' + esc(s.phone) + (s.email ? ' &middot; ' + esc(s.email) : '') + '</span>' +
    (s.tin ? '<span>TIN: ' + esc(s.tin) + '</span>' : '') + '</div></div>' +
    '<div class="doc-title"><h2>' + meta.title + '</h2>' +
    '<div class="meta">Na: ' + esc(d.number) + '<br>Tarehe: ' + fmtDate(d.date) + '</div></div>' +
    '</div>' +
    '<div class="doc-parties">' +
    '<div class="blk"><small>Kwa Mteja</small><b>' + esc(d.clientName) + '</b>' +
    (d.clientPhone ? '<p>Simu: ' + esc(d.clientPhone) + '</p>' : '') + '</div>' +
    (d.method ? '<div class="blk" style="text-align:right"><small>Njia ya Malipo</small><b>' + esc(d.method) + '</b></div>' : '') +
    '</div>' +
    '<table class="doc-table"><thead><tr><th>Maelezo</th><th class="r">Idadi</th><th class="r">Bei</th><th class="r">Jumla</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>' +
    '<div class="doc-totals">' + totals + '</div>' +
    (meta.showBank && s.bank ? '<div class="doc-foot"><b>Malipo kwa:</b> ' + esc(s.bank) + '</div>' : '') +
    (d.note ? '<div class="doc-foot"><b>Maelezo:</b> ' + esc(d.note) + '</div>' : '') +
    '<div class="doc-foot"><span class="thanks">' + esc(s.footer) + '</span>' +
    (d.type === "receipt" ? '<br><span class="stamp">IMELIPWA / PAID</span>' : '') + '</div>' +
    '</div>';
}

// =========================================================
//  MATUMIZI
// =========================================================
function renderExpenses() {
  var list = load(DB.expenses, []);
  var el = document.getElementById("expenses-list");
  var total = list.reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
  document.getElementById("e-total").textContent = money(total);
  if (!list.length) { el.innerHTML = '<p class="empty">Bado hakuna matumizi.</p>'; return; }
  el.innerHTML = list.map(function (x) {
    return '<div class="rec"><div class="meta"><b>' + esc(x.desc || x.cat) + '</b>' +
      '<span>' + esc(x.cat) + ' &middot; ' + fmtDate(x.date) + '</span></div>' +
      '<div class="amt">' + money(x.amount) + '</div>' +
      '<button class="btn btn-sm" style="background:#fdeceb;color:var(--red)" onclick="delExpense(\'' + x.id + '\')">Futa</button></div>';
  }).join("");
}
window.delExpense = function (id) {
  if (!confirm("Futa tumizi hili?")) return;
  save(DB.expenses, load(DB.expenses, []).filter(function (x) { return x.id !== id; }));
  renderExpenses();
};
document.getElementById("e-save").addEventListener("click", function () {
  var amount = Number(document.getElementById("e-amount").value || 0);
  if (!amount) { alert("Weka kiasi cha tumizi."); return; }
  var list = load(DB.expenses, []);
  list.unshift({
    id: uid(),
    date: document.getElementById("e-date").value || today(),
    cat: document.getElementById("e-cat").value,
    desc: document.getElementById("e-desc").value.trim(),
    amount: amount
  });
  save(DB.expenses, list);
  document.getElementById("e-desc").value = ""; document.getElementById("e-amount").value = "";
  renderExpenses();
});

// =========================================================
//  RIPOTI
// =========================================================
function renderReports() {
  var docs = load(DB.docs, []);
  var expenses = load(DB.expenses, []);
  var income = docs.filter(function (d) { return d.type === "receipt"; }).reduce(function (a, b) { return a + b.total; }, 0);
  var exp = expenses.reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
  var pending = docs.filter(function (d) { return d.type === "invoice" && d.status !== "Imelipwa"; }).reduce(function (a, b) { return a + b.total; }, 0);
  document.getElementById("r-income").textContent = Number(income).toLocaleString("en-US");
  document.getElementById("r-expense").textContent = Number(exp).toLocaleString("en-US");
  document.getElementById("r-profit").textContent = Number(income - exp).toLocaleString("en-US");
  document.getElementById("r-pending").textContent = Number(pending).toLocaleString("en-US");

  var cats = {};
  expenses.forEach(function (x) { cats[x.cat] = (cats[x.cat] || 0) + Number(x.amount || 0); });
  var keys = Object.keys(cats);
  var box = document.getElementById("reports-cats");
  if (!keys.length) { box.innerHTML = '<p class="empty">Bado hakuna data ya matumizi.</p>'; return; }
  var max = Math.max.apply(null, keys.map(function (k) { return cats[k]; }));
  box.innerHTML = keys.map(function (k) {
    var pct = Math.round(cats[k] / max * 100);
    return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:4px">' +
      '<span>' + esc(k) + '</span><b>' + money(cats[k]) + '</b></div>' +
      '<div style="background:var(--concrete);border-radius:3px;height:10px"><div style="width:' + pct + '%;height:10px;background:var(--navy);border-radius:3px"></div></div></div>';
  }).join("");
}

// =========================================================
//  DASHBOARD MUHTASARI
// =========================================================
function renderDashboard() {
  var clients = load(DB.clients, []);
  var projects = load(DB.projects, []);
  var docs = load(DB.docs, []);
  var expenses = load(DB.expenses, []);
  var income = docs.filter(function (d) { return d.type === "receipt"; }).reduce(function (a, b) { return a + b.total; }, 0);
  var exp = expenses.reduce(function (a, b) { return a + Number(b.amount || 0); }, 0);
  document.getElementById("s-clients").textContent = clients.length;
  document.getElementById("s-projects").textContent = projects.length;
  document.getElementById("s-income").textContent = Number(income).toLocaleString("en-US");
  document.getElementById("s-expense").textContent = Number(exp).toLocaleString("en-US");

  var recent = docs.slice(0, 6);
  var el = document.getElementById("recent-docs");
  if (!recent.length) { el.innerHTML = '<p class="empty">Bado hakuna nyaraka.</p>'; return; }
  el.innerHTML = recent.map(function (d) {
    return '<div class="rec"><div class="meta"><span class="badge ' + d.type + '">' + d.type + '</span> <b>' + esc(d.number) + '</b>' +
      '<span>' + esc(d.clientName) + ' &middot; ' + fmtDate(d.date) + '</span></div>' +
      '<div class="amt">' + money(d.total) + '</div></div>';
  }).join("");
}

// =========================================================
//  SETTINGS
// =========================================================
function loadSettingsForm() {
  var s = getSettings();
  document.getElementById("set-name").value = s.name;
  document.getElementById("set-phone").value = s.phone;
  document.getElementById("set-email").value = s.email;
  document.getElementById("set-address").value = s.address;
  document.getElementById("set-tin").value = s.tin;
  document.getElementById("set-currency").value = s.currency;
  document.getElementById("set-bank").value = s.bank;
  document.getElementById("set-vat").value = s.vat;
  document.getElementById("set-vatrate").value = s.vatrate;
  document.getElementById("set-footer").value = s.footer;
  var acc = load(DB.account, { user: "admin", pass: "hmc2026" });
  document.getElementById("acc-user").value = acc.user;
}
document.getElementById("set-save").addEventListener("click", function () {
  save(DB.settings, {
    name: document.getElementById("set-name").value.trim(),
    phone: document.getElementById("set-phone").value.trim(),
    email: document.getElementById("set-email").value.trim(),
    address: document.getElementById("set-address").value.trim(),
    tin: document.getElementById("set-tin").value.trim(),
    currency: document.getElementById("set-currency").value.trim() || "TZS",
    bank: document.getElementById("set-bank").value.trim(),
    vat: document.getElementById("set-vat").value,
    vatrate: Number(document.getElementById("set-vatrate").value || 0),
    footer: document.getElementById("set-footer").value.trim()
  });
  alert("Settings zimehifadhiwa.");
  document.getElementById("who").textContent = getSettings().name;
});
document.getElementById("acc-save").addEventListener("click", function () {
  var acc = load(DB.account, { user: "admin", pass: "hmc2026" });
  acc.user = document.getElementById("acc-user").value.trim() || acc.user;
  var np = document.getElementById("acc-pass").value;
  if (np) acc.pass = np;
  save(DB.account, acc);
  document.getElementById("acc-pass").value = "";
  alert("Akaunti imesasishwa.");
});

// Backup / Restore
document.getElementById("data-export").addEventListener("click", function () {
  var dump = {};
  Object.keys(DB).forEach(function (k) { dump[DB[k]] = load(DB[k], null); });
  var blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "hmc-backup-" + today() + ".json";
  a.click();
});
document.getElementById("data-import").addEventListener("change", function (e) {
  var file = e.target.files[0]; if (!file) return;
  var r = new FileReader();
  r.onload = function () {
    try {
      var data = JSON.parse(r.result);
      Object.keys(data).forEach(function (k) { if (data[k] != null) localStorage.setItem(k, JSON.stringify(data[k])); });
      alert("Data imerejeshwa. Ukurasa utaanza upya.");
      location.reload();
    } catch (err) { alert("Faili si sahihi."); }
  };
  r.readAsText(file);
});
document.getElementById("data-clear").addEventListener("click", function () {
  if (!confirm("Hii itafuta WATEJA, MIRADI, NYARAKA na MATUMIZI yote. Una uhakika?")) return;
  [DB.clients, DB.projects, DB.docs, DB.expenses].forEach(function (k) { localStorage.removeItem(k); });
  alert("Data zimefutwa.");
  location.reload();
});

// =========================================================
//  REFRESH ROUTER
// =========================================================
function refresh(tab) {
  if (tab === "dashboard") renderDashboard();
  else if (tab === "clients") { renderClients(); fillClientSelects(); }
  else if (tab === "projects") { renderProjects(); fillClientSelects(); }
  else if (tab === "invoice" || tab === "quotation" || tab === "receipt") buildDocPanel(tab);
  else if (tab === "expenses") renderExpenses();
  else if (tab === "reports") renderReports();
  else if (tab === "settings") loadSettingsForm();
}

// ---- Mwanzo ----
document.getElementById("who").textContent = getSettings().name;
document.getElementById("e-date") && (document.getElementById("e-date").value = today());
renderDashboard();
