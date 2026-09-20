(function () {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".mode-panel");
  const shownPanels = new Set();

  function activate(mode) {
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    panels.forEach((p) => p.classList.toggle("active", p.dataset.mode === mode));

    if (!shownPanels.has(mode)) {
      shownPanels.add(mode);
      const panel = document.querySelector(`.mode-panel[data-mode="${mode}"]`);
      const hint = panel.querySelector(".hint");
      setTimeout(() => hint.classList.add("hidden"), 2600);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.mode));
  });

  activate("facts");
})();
