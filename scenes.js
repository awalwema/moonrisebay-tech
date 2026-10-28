// Section scenes: each [data-scene] plays its intro once when it scrolls into view, then a quiet loop.
// Nothing pins the scroll; videos load only as the scene approaches; the loop pauses off screen.
document.addEventListener("DOMContentLoaded", () => {
  const scenes = document.querySelectorAll("[data-scene]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  scenes.forEach((scene) => {
    const still = scene.querySelector(".scene-still");
    const intro = scene.querySelector(".scene-intro");
    const loop = scene.querySelector(".scene-loop");

    if (reducedMotion || !intro || !loop) {
      if (still?.dataset.still) still.src = still.dataset.still; // show the finished scene
      return;
    }

    let loaded = false;
    let started = false;
    let looping = false;
    let visible = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      [intro, loop].forEach((v) => {
        v.src = v.dataset.src;
        v.preload = "auto";
      });
    };

    // Loop fades in over the intro's last frame (they match), the intro stays underneath
    const toLoop = () => {
      if (looping) return;
      looping = true;
      loop.currentTime = 0;
      if (visible && !document.hidden) loop.play().catch(() => {});
      scene.classList.add("is-looping");
    };

    const start = () => {
      if (started || document.hidden) return;
      started = true;
      intro.play().catch(toLoop); // if playback is refused, settle straight into the loop
    };

    // Show the intro only once it is actually playing, so the still never flashes to an empty frame
    intro.addEventListener("playing", () => scene.classList.add("is-playing"), { once: true });
    intro.addEventListener("ended", toLoop);

    // Start loading a screen ahead of time
    new IntersectionObserver(
      ([entry]) => entry.isIntersecting && load(),
      { rootMargin: "600px 0px" }
    ).observe(scene);

    // Play once it is properly in view; pause the loop when it is not
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.5;
        if (visible) {
          load();
          if (!started) start();
          else if (looping) loop.play().catch(() => {});
        } else if (looping) {
          loop.pause();
        }
      },
      { threshold: [0, 0.5] }
    ).observe(scene);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      if (visible && !started) start();
      else if (visible && looping) loop.play().catch(() => {});
    });
  });
});
