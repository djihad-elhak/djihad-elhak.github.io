(function () {
  // Theme: system → light → dark → system. "system" removes the override so the page
  // follows prefers-color-scheme again; the choice is kept in localStorage.
  var root = document.documentElement;
  var btn = document.querySelector(".theme-toggle");
  var order = ["system", "light", "dark"];
  function current() { return root.getAttribute("data-theme") || "system"; }
  function render() {
    if (!btn) return;
    var t = current();
    btn.textContent = "Theme: " + t;
    btn.setAttribute("aria-label", "Colour theme: " + t + ". Activate to change.");
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var next = order[(order.indexOf(current()) + 1) % order.length];
      if (next === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", next);
      try { next === "system" ? localStorage.removeItem("theme") : localStorage.setItem("theme", next); } catch (e) {}
      render();
    });
    render();
  }

  // Video chapters on case studies
  document.querySelectorAll("button[data-t]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = document.getElementById(b.dataset.v);
      if (!v) return;
      v.currentTime = Number(b.dataset.t);
      v.play();
    });
  });
})();
