// Some phones won't start any video on their own (iOS Low Power Mode, data savers): play() is refused until the visitor taps,
// and scrolling doesn't count. Safari still plays an MP4 shown in an <img> (like a GIF), so a refused loop fades in as an image
// over whatever is on screen. Browsers that can't do that show the finished still instead, and the next tap starts what is
// waiting (a tap only counts while it is being handled, so retries run inside the tap listener). Shared with scenes.js.
window.mbMotion = (() => {
  const waiting = new Map(); // video -> what to do once a tap allows playback
  const handled = new WeakSet(); // refused videos already dealt with (running as an image, or waiting for a tap)
  let reported = false; // GA hears once per page view that video was held back (how many visitors see stills)
  const retry = () => {
    const jobs = [...waiting.values()];
    waiting.clear();
    jobs.forEach((job) => job());
  };
  ["touchend", "click", "keydown"].forEach((type) => window.addEventListener(type, retry, { capture: true, passive: true }));

  // A copy of `template` (same place and size) showing the MP4, faded in once it is ready (rejects where <img> can't play MP4)
  const fadeInAsImage = (template, src) =>
    new Promise((resolve, reject) => {
      const pic = template.cloneNode();
      pic.removeAttribute("loading");
      pic.classList.add("motion-image");
      pic.onload = () => {
        requestAnimationFrame(() => pic.classList.add("is-on"));
        resolve();
      };
      pic.onerror = () => {
        pic.remove();
        reject();
      };
      pic.src = src;
      template.after(pic);
    });

  return {
    // play `video`; if the browser refuses, fade `src` in as an image over `img`.
    // Where that can't work: onBlocked() now (show the still) and onTap() inside the next tap.
    play(video, { img, src, onBlocked = () => {}, onTap } = {}) {
      if (handled.has(video)) return Promise.resolve();
      return video.play().catch((err) => {
        if (err?.name !== "NotAllowedError") return;
        if (!reported) {
          reported = true;
          window.mbTrack?.("video_blocked");
        }
        handled.add(video);
        const waitForTap = () => {
          onBlocked();
          handled.delete(video);
          waiting.set(video, onTap || (() => this.play(video)));
        };
        if (img && src) fadeInAsImage(img, src).catch(waitForTap);
        else waitForTap();
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
  const idleImage = hero.querySelector(".bay-idle-image");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !media || !intro || !idle) return; // CSS shows the still scene instead

  let introStarted = false;
  let introDone = false;
  let heroVisible = true;

  // Loop playback. If the browser refuses video, the loop runs as an image over the still (never a frozen nap)
  const playIdle = () =>
    window.mbMotion.play(idle, {
      img: idleImage,
      src: idle.querySelector("source")?.src,
      onBlocked: () => hero.classList.add("no-intro"), // can't move at all: show him awake (the finished scene)
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
      // Video refused (Low Power Mode): go straight to the loop, which fades in over the opening frame as an image.
      // Only loops can run as an image (an image can't tell us when a one-off clip ends), so the intro is skipped.
      else if (err?.name === "NotAllowedError") toIdle("blocked");
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
