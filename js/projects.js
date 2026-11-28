/* =========================================================
   HMC — Miradi (chanzo kimoja cha data)
   Inatumiwa na index.html (miradi teule) na portfolio.html (yote).
   Kuongeza mradi: ongeza kitu kimoja kwenye orodha hapa chini.
   Hali (status): "Inaendelea" au "Imekamilika".
   Weka "Imekamilika" tu kama picha inaonyesha jengo lililokamilika la HMC.
   ========================================================= */
var HMC_PROJECTS = [
  {
    id: "ujenzi-nyumba-kisasa",
    name: "Ujenzi wa Nyumba ya Kisasa",
    location: "Dar es Salaam",
    category: "Ujenzi wa Nyumba",
    status: "Inaendelea",
    image: "assets/mradi-2.jpg",
    alt: "Kuta za matofali na nguzo za nyumba inayojengwa",
    summary: "Ujenzi wa kuta na nguzo kwa matofali bora, ukifuata mchoro uliopangwa hatua kwa hatua.",
    featured: true
  },
  {
    id: "sakafu-nguzo-chuma",
    name: "Sakafu & Nguzo za Chuma",
    location: "Dar es Salaam",
    category: "Ujenzi wa Nyumba",
    status: "Inaendelea",
    image: "assets/mradi-1.jpg",
    alt: "Mafundi wakiweka nondo za sakafu (slab)",
    summary: "Uwekaji wa nondo na maandalizi ya sakafu (slab) kwa usahihi wa kiufundi na usimamizi wa karibu.",
    featured: true
  },
  {
    id: "msingi-nguzo-imara",
    name: "Msingi & Nguzo Imara",
    location: "Dar es Salaam",
    category: "Ujenzi wa Nyumba",
    status: "Inaendelea",
    image: "assets/mradi-3.jpg",
    alt: "Msingi wa jengo na nguzo za nondo",
    summary: "Ujenzi wa msingi wa kuaminika pamoja na nguzo za nondo, msingi wa jengo lenye nguvu.",
    featured: false
  },
  {
    id: "kuta-za-msingi",
    name: "Kuta za Msingi kwa Matofali",
    location: "Dar es Salaam",
    category: "Ujenzi wa Nyumba",
    status: "Inaendelea",
    image: "assets/mradi-4.jpg",
    alt: "Kuta za msingi za matofali na nguzo zikijengwa",
    summary: "Ujenzi wa kuta za msingi kwa matofali na maandalizi ya nguzo, kazi ikiendelea hatua kwa hatua.",
    featured: false
  },
  {
    id: "uchimbaji-msingi",
    name: "Uchimbaji & Maandalizi ya Msingi",
    location: "Dar es Salaam",
    category: "Ujenzi wa Nyumba",
    status: "Inaendelea",
    image: "assets/mradi-5.jpg",
    alt: "Timu ya mafundi wa HMC wakichimba msingi wakiwa na kofia za usalama",
    summary: "Timu yetu ya mafundi ikishughulika na uchimbaji na uwekaji wa msingi kwa usalama na umakini.",
    featured: true
  }
];

(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Kadi moja ya mradi. mode = "featured" (homepage) au "all" (portfolio)
  function card(p, i, mode) {
    var num = String(i + 1).padStart(2, "0");
    var done = p.status === "Imekamilika";
    var detailUrl = "portfolio.html#" + p.id;
    var imgHref = mode === "all" ? p.image : detailUrl;
    var imgAttrs = mode === "all" ? ' target="_blank" rel="noopener"' : "";
    var button = mode === "all"
      ? '<a class="proj-link" href="' + esc(p.image) + '" target="_blank" rel="noopener">Tazama Picha &rarr;</a>'
      : '<a class="proj-link" href="' + detailUrl + '">Tazama Mradi &rarr;</a>';
    return (
      '<article class="proj-card reveal d' + ((i % 3) + 1) + '" id="' + esc(p.id) + '">' +
        '<a href="' + esc(imgHref) + '" class="proj-img"' + imgAttrs + '>' +
          '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" width="1000" height="750" loading="lazy">' +
          '<span class="proj-num">' + num + '</span>' +
        '</a>' +
        '<div class="proj-body">' +
          '<span class="proj-cat">' + esc(p.category) + '</span>' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p>' + esc(p.summary) + '</p>' +
          '<div class="proj-meta">' +
            '<span>&#128205; ' + esc(p.location) + '</span>' +
            '<span class="proj-tag ' + (done ? "complete" : "done") + '">' + esc(p.status) + '</span>' +
          '</div>' +
          button +
        '</div>' +
      '</article>'
    );
  }

  // Jaza kila <div data-projects="featured|all">
  var targets = document.querySelectorAll("[data-projects]");
  for (var t = 0; t < targets.length; t++) {
    var mode = targets[t].getAttribute("data-projects");
    var list = mode === "featured"
      ? HMC_PROJECTS.filter(function (p) { return p.featured; })
      : HMC_PROJECTS;
    targets[t].innerHTML = list.map(function (p, i) { return card(p, i, mode); }).join("");
  }

  // Takwimu za miradi (portfolio): zinahesabiwa kutoka kwenye data
  var stats = {
    total: HMC_PROJECTS.length,
    active: HMC_PROJECTS.filter(function (p) { return p.status === "Inaendelea"; }).length,
    done: HMC_PROJECTS.filter(function (p) { return p.status === "Imekamilika"; }).length
  };
  var statEls = document.querySelectorAll("[data-project-stat]");
  for (var k = 0; k < statEls.length; k++) {
    var key = statEls[k].getAttribute("data-project-stat");
    if (key in stats) statEls[k].textContent = stats[key];
  }

  // Ukifika kutoka "Tazama Mradi" (portfolio.html#id): nenda kwenye kadi na uiangazie
  if (location.hash.length > 1) {
    var el = document.getElementById(location.hash.slice(1));
    if (el && el.classList.contains("proj-card")) {
      el.classList.add("in", "is-target");
      setTimeout(function () { el.scrollIntoView({ block: "center" }); }, 60);
    }
  }
})();
