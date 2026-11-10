// Hero: the intro clip (nap → phone buzz → tumble → ready) plays once, then a seamless idle loop.
// The copy is plain HTML, so nothing waits on the video. The intro starts once the scene is on
// screen (right away, unless the page opened at a deep link) and is only skipped once it has left
// the screen, so the switch never happens in front of the visitor.
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const media = hero.querySelector(".bay-media");
  const intro = hero.querySelector(".bay-intro");
  const idle = hero.querySelector(".bay-idle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !media || !intro || !idle) return; // CSS shows the still scene instead

  let introStarted = false;
  let introDone = false;
  let heroVisible = true;

  // The intro's last frame matches the loop's first frame, so the natural handoff is invisible
  function toIdle(reason) {
    if (introDone) return;
    introDone = true;
    idle.currentTime = 0;
    if (heroVisible && !document.hidden) idle.play().catch(() => {});
    hero.classList.add("is-idle");
    intro.pause();
    window.mbTrack?.("hero_intro_end", { reason });
  }

  // Autoplay refused (rare for muted video): he stays asleep until the first click or tap
  function playOnFirstGesture() {
    const start = () => {
      ["pointerdown", "keydown", "touchstart"].forEach((t) => window.removeEventListener(t, start));
      if (!introDone) intro.play().catch(() => toIdle("blocked"));
    };
    ["pointerdown", "keydown", "touchstart"].forEach((t) => window.addEventListener(t, start, { passive: true }));
  }

  function playIntro() {
    introStarted = true;
    introDone = false;
    hero.classList.remove("is-idle");
    idle.pause();
    intro.currentTime = 0;
    // Browsers won't play video in a background tab: wait until the visitor actually sees the page
    if (document.hidden) {
      document.addEventListener("visibilitychange", playIntro, { once: true });
      return;
    }
    intro.play().catch(() => {
      if (document.hidden) document.addEventListener("visibilitychange", playIntro, { once: true });
      else playOnFirstGesture();
    });
  }

  intro.addEventListener("ended", () => toIdle("ended"));

  // Start when the scene is in view, skip once it is mostly off screen, pause the loop when nobody can see it
  new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.intersectionRatio > 0.35;
      if (!introStarted && entry.intersectionRatio >= 0.5) playIntro();
      const scrolledPast = entry.boundingClientRect.top < 0;
      if (!heroVisible && !introDone && (introStarted || scrolledPast)) toIdle("scrolled-away");
      if (!introDone) return;
      if (heroVisible && !document.hidden) idle.play().catch(() => {});
      else idle.pause();
    },
    { threshold: [0, 0.35, 0.5, 1] }
  ).observe(media);

  document.addEventListener("visibilitychange", () => {
    if (introDone && !document.hidden && heroVisible) idle.play().catch(() => {});
  });
});
