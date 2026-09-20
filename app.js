(function () {
  const feed = document.getElementById("feed-facts");
  const progressFill = document.getElementById("progress-fill-facts");
  const hint = document.getElementById("hint-facts");

  const GRADIENTS = [
    "linear-gradient(160deg, #1f2937 0%, #0f172a 100%)",
    "linear-gradient(160deg, #7c2d12 0%, #1c1917 100%)",
    "linear-gradient(160deg, #1e3a5f 0%, #0b1120 100%)",
    "linear-gradient(160deg, #3f2a56 0%, #150e26 100%)",
    "linear-gradient(160deg, #14532d 0%, #08170e 100%)",
    "linear-gradient(160deg, #7f1d1d 0%, #1a0a0a 100%)",
    "linear-gradient(160deg, #164e63 0%, #06131a 100%)",
    "linear-gradient(160deg, #713f12 0%, #1c1206 100%)",
  ];

  const HEART_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2 4.5 5.6 4c2.1-.3 4 .8 6.4 3.2C14.4 4.8 16.3 3.7 18.4 4c3.6.5 5.2 4.1 3.6 7.7C19.5 16.4 12 21 12 21z"/></svg>`;
  const SHARE_SVG = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/></svg>`;

  const order = FACTS.map((f, i) => i);
  // Light shuffle so repeat visits feel fresh, seeded by date so it's stable per day.
  const seed = new Date().toDateString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  shuffle(order, seed);

  const cards = order.map((idx, position) => buildCard(FACTS[idx], position));
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
  feed.addEventListener("scroll", () => {
    hint.classList.add("hidden");
    requestAnimationFrame(updateProgress);
  }, { passive: true });

  function buildCard(fact, position) {
    const card = document.createElement("section");
    card.className = "card";
    card.style.setProperty("--bg", GRADIENTS[position % GRADIENTS.length]);

    card.innerHTML = `
      <div class="card-inner">
        <span class="tag">${escapeHtml(fact.tag)}</span>
        <p class="fact-text">${escapeHtml(fact.text)}</p>
      </div>
      <div class="counter">${position + 1} / ${FACTS.length}</div>
      <div class="side-actions">
        <button class="action-btn like-btn" aria-label="Like">
          ${HEART_SVG}
          <span class="like-count">0</span>
        </button>
        <button class="action-btn share-btn" aria-label="Share">
          ${SHARE_SVG}
          <span>Share</span>
        </button>
      </div>
    `;

    const likeBtn = card.querySelector(".like-btn");
    const likeCount = card.querySelector(".like-count");
    const shareBtn = card.querySelector(".share-btn");
    let liked = false;

    likeBtn.addEventListener("click", () => toggleLike());
    shareBtn.addEventListener("click", () => shareFact(fact));

    let lastTap = 0;
    card.addEventListener("pointerdown", (e) => {
      const now = Date.now();
      if (now - lastTap < 320) {
        if (!liked) toggleLike();
        spawnHeart(card, e.clientX, e.clientY);
      }
      lastTap = now;
    });

    function toggleLike() {
      liked = !liked;
      likeBtn.classList.toggle("liked", liked);
      likeCount.textContent = liked ? "1" : "0";
      likeBtn.classList.remove("pulse");
      void likeBtn.offsetWidth;
      likeBtn.classList.add("pulse");
    }

    return card;
  }

  function spawnHeart(card, x, y) {
    const rect = card.getBoundingClientRect();
    const heart = document.createElement("div");
    heart.className = "heart-burst";
    heart.innerHTML = HEART_SVG.replace("stroke=\"currentColor\"", "stroke=\"none\"");
    heart.style.left = `${x - rect.left - 45}px`;
    heart.style.top = `${y - rect.top - 45}px`;
    card.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }

  function shareFact(fact) {
    const text = `${fact.text} — via ConstitutionScroll`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function updateProgress() {
    const scrollable = feed.scrollHeight - feed.clientHeight;
    const pct = scrollable > 0 ? feed.scrollTop / scrollable : 0;
    progressFill.style.height = `${Math.max(4, pct * 100)}%`;
  }

  function shuffle(arr, seedVal) {
    let s = seedVal || 1;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
