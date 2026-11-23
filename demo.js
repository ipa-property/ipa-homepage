(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Numbers stripe: count up once in view ===== */
  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countObserver.unobserve(e.target);
    const el = e.target, end = +el.dataset.count;
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduce) return;
    const t0 = performance.now();
    const id = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / 1400);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p === 1) clearInterval(id);
    }, 30);
  }), { threshold: 0.5 });
  counters.forEach((c) => countObserver.observe(c));

  /* ===== Spotlight carousel ===== */
  const track = document.querySelector(".spotlight__track");
  const slides = [...track.children];
  const dots = document.querySelector(".spotlight__dots");
  let index = 0, timer;

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dots.appendChild(b);
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
    [...dots.children].forEach((d, n) => d.setAttribute("aria-selected", n === index));
    restart();
  }
  function restart() {
    clearInterval(timer);
    if (!reduce) timer = setInterval(() => go(index + 1), 6000);
  }
  document.querySelectorAll(".spotlight__arrow[data-dir]").forEach((b) =>
    b.addEventListener("click", () => go(index + +b.dataset.dir)));
  track.addEventListener("mouseenter", () => clearInterval(timer));
  track.addEventListener("mouseleave", restart);
  go(0);

  /* ===== Property types carousel ===== */
  const typeList = document.querySelector(".types__list");
  const typeBtns = document.querySelectorAll("[data-scroll]");
  const syncTypes = () => {
    const max = typeList.scrollWidth - typeList.clientWidth - 2;
    typeBtns[0].disabled = typeList.scrollLeft <= 2;
    typeBtns[1].disabled = typeList.scrollLeft >= max;
  };
  typeBtns.forEach((b) => b.addEventListener("click", () =>
    typeList.scrollBy({ left: +b.dataset.scroll * typeList.clientWidth * 0.8 })));
  typeList.addEventListener("scroll", syncTypes, { passive: true });
  window.addEventListener("resize", syncTypes);
  syncTypes();

  /* ===== Reveal the new sections (same effect as the rest of the page) ===== */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-revealed");
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  [".sec-head > *", ".types__list", ".dest", ".card", ".about__lead > *", ".about__statement", ".about__stats li", ".usp-head > *", ".usp li", ".promo__main", ".promo__side", ".post", ".testi__intro > *"].forEach((sel) =>
    document.querySelectorAll(sel).forEach((el, i) => {
      el.dataset.reveal = "up";
      el.style.setProperty("--d", `${(i % 8) * 80}ms`);
      io.observe(el);
    }));
})();
