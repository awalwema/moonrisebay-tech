// Some phones won't start any video on their own (iOS Low Power Mode, data savers): play() is refused until the visitor taps.
// Then each scene shows its finished still instead of a frozen first frame, and the next tap anywhere starts what is waiting.
// A tap only counts while it is being handled, so retries run inside the tap listener. Shared with scenes.js.
window.mbMotion = (() => {
  const waiting = new Map(); // video -> what to do once a tap allows playback
  const retry = () => {
    const jobs = [...waiting.values()];
    waiting.clear();
    jobs.forEach((job) => job());
  };
  ["touchend", "click", "keydown"].forEach((type) => window.addEventListener(type, retry, { capture: true, passive: true }));
  return {
    // play `video`; if the browser refuses, call onBlocked() now and onTap() inside the next tap
    play(video, { onBlocked = () => {}, onTap } = {}) {
      return video.play().catch((err) => {
        if (err?.name !== "NotAllowedError") return;
        onBlocked();
        waiting.set(video, onTap || (() => this.play(video)));
      });
    },
  };
})();

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

  // Loop playback, unless the browser refuses it until a tap (it stays on the still, never a frozen nap)
  const playIdle = () =>
    window.mbMotion.play(idle, {
      onTap: () => idle.play().then(() => heroVisible || idle.pause(), () => {}),
    });

  // The intro's last frame matches the loop's first frame, so the natural handoff is invisible
  function toIdle(reason) {
    if (introDone) return;
    introDone = true;
    idle.currentTime = 0;
    if (heroVisible && !document.hidden) playIdle();
    hero.classList.add("is-idle");
    intro.pause();
    window.mbTrack?.("hero_intro_end", { reason });
  }

  // Video refused (Low Power Mode): show him awake (the finished scene) and let the first tap start the loop.
  // Waking up mid-page after a tap would look odd, so the intro is skipped.
  function showStill() {
    hero.classList.add("no-intro");
    toIdle("blocked");
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
    intro.play().catch((err) => {
      if (document.hidden) document.addEventListener("visibilitychange", playIntro, { once: true });
      else if (err?.name === "NotAllowedError") showStill();
    });
  }

  intro.addEventListener("ended", () => toIdle("ended"));
  // The loop only shows once it is really playing, so an unplayed (blank) loop never covers what is underneath
  idle.addEventListener("playing", () => hero.classList.add("idle-live"), { once: true });

  // Start when the scene is in view, skip once it is mostly off screen, pause the loop when nobody can see it
  new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.intersectionRatio > 0.35;
      if (!introStarted && entry.intersectionRatio >= 0.5) playIntro();
      const scrolledPast = entry.boundingClientRect.top < 0;
      if (!heroVisible && !introDone && (introStarted || scrolledPast)) toIdle("scrolled-away");
      if (!introDone) return;
      if (heroVisible && !document.hidden) playIdle();
      else idle.pause();
    },
    { threshold: [0, 0.35, 0.5, 1] }
  ).observe(media);

  document.addEventListener("visibilitychange", () => {
    if (introDone && !document.hidden && heroVisible) playIdle();
  });
});
