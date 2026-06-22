// ===== Mobile menu toggle =====
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var links = document.querySelector("nav.links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  // ===== Contact form -> WhatsApp =====
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var message = form.message.value.trim();

      if (!name || !phone || !message) {
        var note = form.querySelector(".form-note");
        if (note) {
          note.textContent = "Tafadhali jaza Jina, Namba ya Simu na Ujumbe.";
          note.style.color = "#c8262f";
        }
        return;
      }

      var text =
        "Habari HMC, naitwa " + name +
        ". Naomba taarifa kuhusu huduma ya: " + service +
        ".\n\nUjumbe: " + message +
        "\n\nNamba yangu ya simu: " + phone;

      var waNumber = "255754769757"; // 0754 769 757
      var url = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank");
      form.reset();
    });
  }

  // Footer year
  var yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// ===== SUPER UPGRADE: scroll reveal, counters, nav glass =====
document.addEventListener("DOMContentLoaded", function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nav glass on scroll
  var header = document.querySelector("header.site");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (r) { r.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (r) { io.observe(r); });
  }

  // Animated counters
  function runCounter(el) {
    var to = parseFloat(el.dataset.to || "0");
    var suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = to + suffix; return; }
    var start = null, dur = 1400;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * to) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll(".count");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }
});
