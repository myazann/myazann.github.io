// Mert Yazan — personal site behaviour. No dependencies.
(function () {
  "use strict";

  var nav = document.querySelector(".site-nav");
  var progress = document.querySelector(".progress");
  var menuButton = document.querySelector(".menu-button");
  var navList = document.getElementById("nav-links");

  // ---- Scroll progress + nav border ----
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress) progress.style.transform = "scaleX(" + ratio + ")";
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  function setMenu(open) {
    if (!menuButton || !navList) return;
    menuButton.setAttribute("aria-expanded", String(open));
    navList.classList.toggle("is-open", open);
    menuButton.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
  }
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    navList.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // ---- Scroll spy for nav links and section dots ----
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section[id]"));
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
  function markActive(id) {
    spyLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) markActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---- Research themes: list each theme's papers from the publication list ----
  var pubIndex = {};
  document.querySelectorAll(".pub[data-key]").forEach(function (li) {
    var link = li.querySelector("h3 a");
    pubIndex[li.dataset.key] = {
      title: link ? link.textContent.trim() : "",
      href: link ? link.getAttribute("href") : null,
      tag: li.dataset.tag || ""
    };
  });

  document.querySelectorAll(".theme[data-papers]").forEach(function (theme, i) {
    var keys = theme.dataset.papers.split(/\s+/).filter(function (k) { return pubIndex[k]; });
    if (!keys.length) return;
    var body = theme.querySelector(".theme-body");
    var listId = "theme-papers-" + (i + 1);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", listId);
    var label = "See " + keys.length + " paper" + (keys.length > 1 ? "s" : "");
    button.innerHTML = '<span class="chev" aria-hidden="true">›</span><span class="toggle-label"></span>';
    button.querySelector(".toggle-label").textContent = label;

    var list = document.createElement("ul");
    list.className = "theme-papers";
    list.id = listId;
    list.hidden = true;
    keys.forEach(function (k) {
      var p = pubIndex[k];
      var li = document.createElement("li");
      var a = document.createElement(p.href ? "a" : "span");
      if (p.href) { a.href = p.href; a.target = "_blank"; a.rel = "noopener"; }
      a.textContent = p.title;
      li.appendChild(a);
      if (p.tag) {
        var tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = p.tag;
        li.appendChild(tag);
      }
      list.appendChild(li);
    });

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      list.hidden = !open;
      button.querySelector(".toggle-label").textContent = open ? "Hide papers" : label;
    });

    body.appendChild(button);
    body.appendChild(list);
  });

  // ---- Publications: show the first few, reveal the rest on request ----
  var showAll = document.querySelector(".show-all");
  if (showAll) {
    var extras = document.querySelectorAll(".pub.is-extra");
    var total = document.querySelectorAll(".pub").length;
    var labelEl = showAll.querySelector(".show-all-label");
    labelEl.textContent = "Show all " + total + " papers";
    extras.forEach(function (li) { li.hidden = true; });
    showAll.hidden = extras.length === 0;
    showAll.addEventListener("click", function () {
      var open = showAll.getAttribute("aria-expanded") !== "true";
      showAll.setAttribute("aria-expanded", String(open));
      extras.forEach(function (li) { li.hidden = !open; });
      labelEl.textContent = open ? "Show fewer papers" : "Show all " + total + " papers";
    });
  }

  // ---- Email: assemble addresses at load to keep them away from simple scrapers ----
  document.querySelectorAll("[data-email-user]").forEach(function (el) {
    var address = el.dataset.emailUser + "@" + el.dataset.emailDomain;
    el.setAttribute("href", "mailto:" + address);
    if (el.hasAttribute("data-email-show")) el.textContent = address;
  });
})();
