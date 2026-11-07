// The cutout character: keyed sprites of him (character/tech/*.webp, cut by tasks/character/scripts/build_moves.py)
// drawn on canvases over live HTML. Every move starts and ends on the same crouch, so any can follow any other.
//
// Hoppers, on the home tech carousel and in each project's tech stack: he hops logo to logo and now and then flips
// over two. The track moves only while he's airborne, so his feet never slide, and the logo under him squashes on
// landing and springs back at takeoff. Hover the logos (tap on touch screens) and he sits down for a drink.
//
// The peek, in a project modal on desktop: once you start reading he stands up from below the sidebar's bottom
// edge, rests his forearms on it and reads along, nodding now and then. Back at the top he ducks away to the logos.
//
// Reduced motion keeps the plain carousels and no character.
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const PRESS = 12; // how far a logo sinks under him, px
  const SQUASH = 0.004; // logo height lost per px of press
  const SPIN = { seconds: 0.75, advance: 2, lift: 1.6 }; // the flip: a tucked forward spin over two logos
  const STAND_FPS = 26; // standing up is the sit-down played backwards, a little quicker
  const REST_ON_TAP = 6; // seconds a tap keeps him sitting on touch screens
  const HURRY = 3; // drink playback speed once the visitor moves on

  // Sprites, loaded once and shared by every hopper
  let cell = null;
  const moves = {}; // name -> { name, sheet, cols, fps, steps, flights, exits, loaded }

  // A move is a list of steps (sheet frame, foot drop, spin) plus its flights in step units
  const prepare = (name, data) => {
    const steps = [];
    const at = [];
    for (let i = 0; i < data.frames; i++) {
      if (i === data.spinAt) {
        const n = Math.round(SPIN.seconds * data.fps);
        for (let s = 0; s < n; s++) steps.push({ f: data.tuck, drop: 0, spin: true });
      }
      at.push(steps.length);
      steps.push({ f: i, drop: data.drop?.[i] || 0 });
    }
    const flights = data.flights.map(([a, b, advance]) => ({ start: at[a], end: at[b - 1] + 1, advance }));
    if (data.spinAt !== undefined) {
      const start = at[data.spinAt - 1] + 1;
      flights.push({ start, end: at[data.spinAt], advance: SPIN.advance, spin: true });
    }
    flights.sort((x, y) => x.start - y.start);
    return { name, cols: data.cols, fps: data.fps, steps, flights, exits: data.exits && new Set(data.exits) };
  };

  const loadSheet = (name, src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        moves[name].sheet = img;
        moves[name].loaded = true;
        if (name === "sit") Object.assign(moves.stand, { sheet: img, loaded: true }); // standing up shares the sit-down frames
        resolve();
      };
      img.src = src;
    });

  // Resolves once he can hop; the other moves keep loading behind it
  let library = null;
  let srcs = {};
  const loadLibrary = () =>
    (library ??= (async () => {
      const manifest = await (await fetch("character/tech/manifest.json")).json();
      cell = {
        w: manifest.cell[0],
        h: manifest.cell[1],
        feetX: manifest.feetX,
        feetY: manifest.feetY,
        reach: manifest.reach,
        ledge: manifest.ledge,
      };
      srcs = Object.fromEntries(Object.entries(manifest.moves).map(([name, data]) => [name, data.src]));
      for (const [name, data] of Object.entries(manifest.moves)) moves[name] = prepare(name, data);
      const sit = moves.sit;
      moves.stand = { ...sit, name: "stand", fps: STAND_FPS, steps: [...sit.steps].reverse(), flights: [], loaded: false };
      await loadSheet("hop", manifest.moves.hop.src);
      (async () => {
        for (const name of ["flip", "sit", "sip"]) await loadSheet(name, manifest.moves[name].src);
      })();
    })());

  // One hopper per carousel. `height` gives his size in px; `label` is text he must never reach.
  const createHopper = ({ stage, scroller, track, label, height }) => {
    const canvas = document.createElement("canvas");
    canvas.className = "tech-hopper";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");

    let items = [];
    let count = 0; // logos in one copy of the list
    let centers = [];
    let half = 0;
    let standX = 0;
    let tileTop = 0;
    let tileHeight = 0;
    let scale = 0;
    let margin = 0; // room around the cell so the flip can rotate without clipping
    let arc = 0;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let drawn = "";

    // Playback
    let move = null;
    let pos = 0; // position in the current move, in steps
    let baseTile = 0; // logo he stood on when this move began, counting forever rather than wrapping
    let wasAir = false;
    let presses = new Map(); // logo index -> { down, up } times in seconds

    // Choosing what comes next
    let hovering = false;
    let restUntil = 0; // animation clock time a tap's rest runs out
    const wantsRest = () => hovering || clock < restUntil;
    let seated = false;
    let hopsLeft = 2; // hops before the next flip

    const measure = () => {
      items = [...track.children];
      count = items.length / 2;
      centers = items.slice(0, count).map((el) => el.offsetLeft + el.offsetWidth / 2);
      half = items[count].offsetLeft - items[0].offsetLeft;
      tileTop = scroller.offsetTop + parseFloat(getComputedStyle(scroller).paddingTop);
      tileHeight = items[0].offsetHeight;

      const size = height();
      scale = size / cell.h;

      // Stand 30% in, but never so far right that an outstretched arm reaches a label above the logos
      standX = scroller.clientWidth * 0.3;
      if (label.offsetTop < scroller.offsetTop) {
        const text = document.createRange();
        text.selectNodeContents(label);
        const labelLeft = text.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
        standX = Math.max(scroller.clientWidth * 0.18, Math.min(standX, labelLeft - cell.reach * scale - 8));
      }
      arc = size * 0.2;
      margin = cell.h * 0.3;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cell.w + margin * 2;
      const h = cell.h + margin * 2;
      canvas.width = Math.round(w * scale * dpr);
      canvas.height = Math.round(h * scale * dpr);
      canvas.style.width = `${w * scale}px`;
      canvas.style.height = `${h * scale}px`;
      canvas.style.left = `${scroller.offsetLeft + standX - (margin + cell.feetX) * scale}px`;
      canvas.style.top = `${tileTop - (margin + cell.feetY) * scale + 4}px`;
      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0); // draw in cell pixels
      drawn = "";
    };

    // Logo centre for logo n, counting forever rather than wrapping
    const centerOf = (n) => centers[n % count] + Math.floor(n / count) * half;

    const press = ({ down, up }) => {
      const settled = PRESS * Math.sin(Math.min(((up ?? clock) - down) / 0.14, 1) * (Math.PI / 2));
      if (up === null) return settled;
      const u = clock - up;
      return settled * Math.cos(u * 20) * Math.exp(-u * 6);
    };

    const setPress = (n, d) => {
      const transform = d === null ? "" : `translateY(${d.toFixed(2)}px) scaleY(${(1 - d * SQUASH).toFixed(4)})`;
      items[n % count].style.transform = transform;
      items[(n % count) + count].style.transform = transform;
    };

    const pick = () => {
      if (wantsRest() && moves.sip.loaded) return seated ? "sip" : "sit";
      if (seated) return "stand";
      if (hopsLeft > 0 || !moves.flip.loaded) {
        hopsLeft--;
        return "hop";
      }
      hopsLeft = 4 + Math.floor(Math.random() * 3);
      return "flip";
    };

    const begin = (name) => {
      move = moves[name];
      if (name === "sit") seated = true; // set now so a hover ending mid-sit still stands him back up
      if (name === "stand") seated = false;
    };

    const tick = (time) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.max(0, Math.min((time - last) / 1000, 0.05)); // a frame's timestamp can predate start()
      clock += dt;
      last = time;

      // Once you move on he hurries through his drink to a moment he can stand up from
      const hurry = move.name === "sip" && !wantsRest() ? HURRY : 1;
      pos += dt * move.fps * hurry;
      const leaveSip = hurry > 1 && move.exits.has(Math.floor(pos));
      if (pos >= move.steps.length || leaveSip) {
        baseTile += move.flights.reduce((sum, f) => sum + f.advance, 0);
        const spare = leaveSip ? 0 : (pos - move.steps.length) / move.fps;
        begin(pick());
        pos = spare * move.fps;
      }
      const step = move.steps[Math.min(Math.floor(pos), move.steps.length - 1)];

      // Where the track is: whole logos for finished flights, eased progress through the current one
      let onTile = baseTile;
      let flight = null;
      let progress = 0;
      for (const f of move.flights) {
        if (pos >= f.end) onTile += f.advance;
        else if (pos >= f.start) {
          flight = f;
          progress = (pos - f.start) / (f.end - f.start);
        }
      }
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
      const center = flight ? centerOf(onTile) + (centerOf(onTile + flight.advance) - centerOf(onTile)) * eased : centerOf(onTile);
      const wrapped = (((center - standX) % half) + half) % half;
      track.style.transform = `translate3d(${(-wrapped).toFixed(2)}px, 0, 0)`;

      // Logos: pressed while he stands on one, springing back after he leaves
      const air = flight !== null;
      if (air && !wasAir && presses.has(onTile)) presses.get(onTile).up = clock;
      if (!air && wasAir) presses.set(onTile, { down: clock, up: null });
      wasAir = air;
      for (const [n, p] of presses) {
        if (p.up !== null && clock - p.up > 1) {
          presses.delete(n);
          setPress(n, null);
        } else setPress(n, press(p));
      }

      // Him: ride the pressed logo on the ground, arc over the track when it moves
      let y = step.drop * scale;
      if (!air && presses.has(onTile)) y += press(presses.get(onTile)) * (1 + tileHeight * SQUASH);
      else if (flight.advance > 0) y -= arc * (flight.spin ? SPIN.lift : 1) * 4 * progress * (1 - progress);
      canvas.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;

      const angle = step.spin ? progress * 360 : 0;
      const key = `${move.name}:${step.f}:${angle.toFixed(1)}`;
      if (key === drawn) return;
      drawn = key;
      const sx = (step.f % move.cols) * cell.w;
      const sy = Math.floor(step.f / move.cols) * cell.h;
      ctx.clearRect(0, 0, cell.w + margin * 2, cell.h + margin * 2);
      if (step.spin) {
        // Spin the tucked pose about its middle, held at hip height above his feet
        ctx.save();
        ctx.translate(margin + cell.feetX, margin + cell.feetY - cell.h * 0.35);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(move.sheet, sx, sy, cell.w, cell.h, -cell.w / 2, -cell.h / 2, cell.w, cell.h);
        ctx.restore();
      } else {
        ctx.drawImage(move.sheet, sx, sy, cell.w, cell.h, margin, margin, cell.w, cell.h);
      }
    };

    const start = () => {
      if (!move || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // (Re)start on whatever logos the track holds now: first show, or a project modal refilling its stack
    const reset = () => {
      stop();
      if (!canvas.isConnected) stage.appendChild(canvas);
      canvas.style.opacity = "";
      track.classList.add("is-driven"); // JS owns the track from here
      scroller.classList.add("is-hopping");
      presses = new Map([[0, { down: -10, up: null }]]);
      baseTile = 0;
      pos = 0;
      wasAir = false;
      seated = false;
      restUntil = 0;
      hopsLeft = 2;
      measure();
      begin("hop");
    };

    if (window.matchMedia("(hover: hover)").matches) {
      scroller.addEventListener("mouseenter", () => (hovering = true));
      scroller.addEventListener("mouseleave", () => (hovering = false));
    } else {
      // A tap sits him down for a few seconds; another tap sends him back to hopping
      scroller.addEventListener("click", () => (restUntil = wantsRest() ? 0 : clock + REST_ON_TAP));
    }
    window.addEventListener("resize", () => move && measure());
    document.fonts?.ready.then(() => move && measure());

    // Step off while the peek has him; the fade covers the swap
    const setAway = (away) => {
      canvas.style.opacity = away ? "0" : "";
      if (away) stop();
      else start();
    };

    return { start, stop, reset, setAway };
  };

  const createPeek = ({ host, sidebar, main, hopper }) => {
    const READ_FROM = 160; // px into the project before he comes up to read
    const DUCK_BELOW = 60; // px from the top where he goes back to the logos
    const RISE_FPS = 24;
    const DUCK_FPS = 40;
    const canvas = document.createElement("canvas");
    canvas.className = "peek-companion";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");

    let state = "hidden"; // hidden | rising | reading | ducking
    let pos = 0;
    let raf = 0;
    let last = 0;
    let shown = 0; // px of him above the edge
    let drawn = "";
    let loading = null;

    // Empty sidebar below its last item, which is where he lives
    const room = () => sidebar.getBoundingClientRect().bottom - sidebar.lastElementChild.getBoundingClientRect().bottom - 24;
    const fits = () => window.innerWidth > 968 && sidebar.scrollHeight <= sidebar.clientHeight && room() >= 110;

    const layout = () => {
      shown = Math.min(170, room());
      const scale = shown / cell.ledge[1];
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cell.w * scale * dpr);
      canvas.height = Math.round(cell.h * scale * dpr);
      canvas.style.width = `${cell.w * scale}px`;
      canvas.style.height = `${cell.h * scale}px`;
      const box = host.getBoundingClientRect();
      // Hands just short of the sidebar's right edge, forearms resting on the modal's bottom edge
      canvas.style.left = `${sidebar.getBoundingClientRect().right - box.left - cell.ledge[0] * scale - 14}px`;
      canvas.style.top = `${box.height - cell.ledge[1] * scale - 6}px`;
      ctx.setTransform(canvas.width / cell.w, 0, 0, canvas.height / cell.h, 0, 0);
      drawn = "";
    };

    const tick = (time) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.max(0, Math.min((time - last) / 1000, 0.05)); // a frame's timestamp can predate start()
      last = time;
      const rise = moves.peekrise;
      const read = moves.peekread;

      let move = rise;
      if (state === "rising") {
        pos += dt * RISE_FPS;
        if (pos >= rise.steps.length) {
          state = "reading";
          pos = 0;
        }
      } else if (state === "ducking") {
        pos -= dt * DUCK_FPS;
        if (pos <= 0) {
          state = "hidden";
          cancelAnimationFrame(raf);
          raf = 0;
          canvas.remove();
          hopper.setAway(false);
          return;
        }
      }
      if (state === "reading") {
        move = read;
        pos = (pos + dt * read.fps) % read.steps.length;
      }

      // Coming up from below the edge over the first half of standing up
      const up = state === "reading" ? 1 : Math.min(pos / (rise.steps.length * 0.5), 1);
      const y = (1 - (0.5 - Math.cos(up * Math.PI) / 2)) * shown;
      canvas.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;

      const f = move.steps[Math.min(Math.floor(pos), move.steps.length - 1)].f;
      const key = `${move.name}:${f}`;
      if (key === drawn) return;
      drawn = key;
      ctx.clearRect(0, 0, cell.w, cell.h);
      ctx.drawImage(move.sheet, (f % move.cols) * cell.w, Math.floor(f / move.cols) * cell.h, cell.w, cell.h, 0, 0, cell.w, cell.h);
    };

    const run = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const comeUp = async () => {
      loading ??= Promise.all(["peekrise", "peekread"].map((name) => loadSheet(name, srcs[name])));
      await loading;
      if (main.scrollTop <= READ_FROM || !fits()) return; // moved on while the frames loaded
      if (state === "hidden") {
        hopper.setAway(true);
        layout();
        host.appendChild(canvas);
        pos = 0;
      }
      state = "rising";
      run();
    };

    const goDown = () => {
      if (state === "reading") pos = moves.peekrise.steps.length - 1;
      state = "ducking";
      run();
    };

    main.addEventListener(
      "scroll",
      () => {
        if ((state === "hidden" || state === "ducking") && main.scrollTop > READ_FROM && fits()) comeUp();
        else if ((state === "rising" || state === "reading") && main.scrollTop < DUCK_BELOW) goDown();
      },
      { passive: true }
    );
    window.addEventListener("resize", () => state !== "hidden" && layout());

    // A new project or a closed modal: gone at once, back on the logos
    const reset = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      state = "hidden";
      canvas.remove();
    };

    return { reset };
  };

  // Home: the "Technologies I Work With" carousel, started as it nears the screen
  const homeStage = document.querySelector("[data-hopper='home']");
  if (homeStage) {
    const hopper = createHopper({
      stage: homeStage,
      scroller: homeStage.querySelector(".home-tech-scroll"),
      track: homeStage.querySelector("#home-tech-logos"),
      label: homeStage.querySelector(".tech-stage-label"),
      height: () => (window.innerWidth < 640 ? 140 : 170),
    });
    let started = false;
    new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return hopper.stop();
        await loadLibrary();
        if (!started) hopper.reset();
        started = true;
        hopper.start();
      },
      { rootMargin: "300px 0px" }
    ).observe(homeStage);
  }

  // Project modal: the tech stack in the sidebar, restarted each time a project opens (main.js fires project-modal)
  const modalStage = document.querySelector("[data-hopper='modal']");
  if (modalStage) {
    const hopper = createHopper({
      stage: modalStage,
      scroller: modalStage.querySelector(".tech-stack-scroll"),
      track: modalStage.querySelector("#modal-tech-logos"),
      label: modalStage.querySelector(".tech-stage-label"),
      height: () => (window.innerWidth < 640 ? 110 : 130),
    });
    const content = modalStage.closest(".modal-content");
    const peek = createPeek({
      host: content,
      sidebar: content.querySelector(".modal-sidebar"),
      main: content.querySelector(".modal-main"),
      hopper,
    });
    document.addEventListener("project-modal", async ({ detail }) => {
      peek.reset();
      if (!detail.open) return hopper.stop();
      await loadLibrary();
      requestAnimationFrame(() => {
        hopper.reset(); // after the modal has laid out its new logos
        hopper.start();
      });
    });
  }
});
