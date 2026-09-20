(function () {
  const feed = document.getElementById("feed-text");
  const progressFill = document.getElementById("progress-fill-text");
  const hint = document.getElementById("hint-text");

  const ARTICLE_GRADIENTS = [
    "linear-gradient(160deg, #1e3a5f 0%, #0b1120 100%)",
    "linear-gradient(160deg, #164e63 0%, #06131a 100%)",
    "linear-gradient(160deg, #1f2937 0%, #0f172a 100%)",
    "linear-gradient(160deg, #3f2a56 0%, #150e26 100%)",
  ];
  const AMENDMENT_GRADIENTS = [
    "linear-gradient(160deg, #7c2d12 0%, #1c1917 100%)",
    "linear-gradient(160deg, #713f12 0%, #1c1206 100%)",
    "linear-gradient(160deg, #7f1d1d 0%, #1a0a0a 100%)",
    "linear-gradient(160deg, #14532d 0%, #08170e 100%)",
  ];

  const cards = ENTRIES.map((entry, i) => buildCard(entry, i));
  cards.forEach((c) => feed.appendChild(c));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("active", entry.isIntersecting);
      });
    },
    { root: feed, threshold: 0.55 }
  );
  cards.forEach((c) => io.observe(c));

  updateProgress();
  feed.addEventListener(
    "scroll",
    () => {
      hint.classList.add("hidden");
      requestAnimationFrame(updateProgress);
    },
    { passive: true }
  );

  function buildCard(entry, index) {
    const gradients = entry.kind === "article" ? ARTICLE_GRADIENTS : AMENDMENT_GRADIENTS;
    const card = document.createElement("section");
    card.className = "card read-card";
    card.style.setProperty("--bg", gradients[index % gradients.length]);

    const ratifiedChip = entry.ratified
      ? `<span class="chip ratified">Ratified ${escapeHtml(entry.ratified)}</span>`
      : "";
    const kindLabel = entry.kind === "article" ? "Article" : "Amendment";

    card.innerHTML = `
      <div class="card-inner">
        <div class="entry-header">
          <span class="chip kind-${entry.kind}">${kindLabel}</span>
          ${ratifiedChip}
        </div>
        <h1 class="entry-title">${escapeHtml(entry.title)}</h1>
        <p class="entry-subtitle">${escapeHtml(entry.subtitle)}</p>
        <div class="pager">
          ${entry.pages
            .map(
              (page) => `
            <div class="page">
              ${page.label ? `<span class="section-label">${escapeHtml(page.label)}</span>` : ""}
              <p class="page-text">${escapeHtml(page.text)}</p>
            </div>
          `
            )
            .join("")}
        </div>
        ${entry.pages.length > 1 ? `<div class="page-dots">${entry.pages.map((_, i) => `<span class="pd${i === 0 ? " active" : ""}"></span>`).join("")}</div>` : ""}
      </div>
      <div class="counter">${index + 1} / ${ENTRIES.length}</div>
    `;

    if (entry.pages.length > 1) {
      const pager = card.querySelector(".pager");
      const dots = card.querySelectorAll(".pd");
      pager.addEventListener(
        "scroll",
        () => {
          const idx = Math.round(pager.scrollLeft / pager.clientWidth);
          dots.forEach((d, i) => d.classList.toggle("active", i === idx));
        },
        { passive: true }
      );
    }

    return card;
  }

  function updateProgress() {
    const scrollable = feed.scrollHeight - feed.clientHeight;
    const pct = scrollable > 0 ? feed.scrollTop / scrollable : 0;
    progressFill.style.height = `${Math.max(4, pct * 100)}%`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
