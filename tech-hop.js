// Tech carousel: he hops logo to logo. The logos stay real HTML; he's a keyed sprite on a canvas above them.
// Every move (character/tech/*.webp, cut by tasks/character/scripts/build_moves.py) starts and ends on the same
// crouch, so any move can follow any other. The track moves only while he's airborne, so his feet never slide,
// and the logo under him squashes on landing and springs back at takeoff.
// Hover the logos (tap on touch screens) and he sits down for a drink until you move on.
// Reduced motion keeps the plain carousel.
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector(".tech-stage");
  const scroller = stage?.querySelector(".home-tech-scroll");
  const track = document.getElementById("home-tech-logos");
  if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const PRESS = 12; // how far a logo sinks under him, px
  const SQUASH = 0.004; // logo height lost per px of press
  const SPIN = { seconds: 0.75, advance: 2, lift: 1.6 }; // the flip: a tucked forward spin over two logos
  const STAND_FPS = 26; // standing up is the sit-down played backwards, a little quicker
  const REST_ON_TAP = 6; // seconds a tap keeps him sitting on touch screens
  const HURRY = 3; // drink playback speed once the visitor moves on

  const canvas = document.createElement("canvas");
  canvas.className = "tech-hopper";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");

  let cell = null;
  const moves = {}; // name -> { sheet, cols, fps, steps, flights, exits, loaded }

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
  const presses = new Map(); // logo index -> { down, up } times in seconds
  presses.set(0, { down: -10, up: null });

  // Choosing what comes next
  let hovering = false;
  let restUntil = 0; // animation clock time a tap's rest runs out
  const wantsRest = () => hovering || clock < restUntil;
  let seated = false;
  let hopsLeft = 2; // hops before the next flip

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
    return { cols: data.cols, fps: data.fps, steps, flights, exits: data.exits && new Set(data.exits) };
  };

  const loadSheet = (name, src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        moves[name].sheet = img;
        moves[name].loaded = true;
        if (name === "sit") moves.stand.sheet = img; // standing up shares the sit-down frames
        if (name === "sit") moves.stand.loaded = true;
        resolve();
      };
      img.src = src;
    });

  const measure = () => {
    items = [...track.children];
    count = items.length / 2;
    centers = items.slice(0, count).map((el) => el.offsetLeft + el.offsetWidth / 2);
    half = items[count].offsetLeft - items[0].offsetLeft;
    tileTop = scroller.offsetTop + parseFloat(getComputedStyle(scroller).paddingTop);
    tileHeight = items[0].offsetHeight;

    const height = window.innerWidth < 640 ? 140 : 170;
    scale = height / cell.h;

    // Stand 30% in, but never so far right that an outstretched arm reaches a label above the logos
    standX = scroller.clientWidth * 0.3;
    const label = stage.querySelector("p");
    if (label.offsetTop < scroller.offsetTop) {
      const text = document.createRange();
      text.selectNodeContents(label);
      const labelLeft = text.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
      standX = Math.max(scroller.clientWidth * 0.18, Math.min(standX, labelLeft - cell.reach * scale - 8));
    }
    arc = height * 0.2;
    margin = cell.h * 0.3;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cell.w + margin * 2;
    const h = cell.h + margin * 2;
    canvas.width = Math.round(w * scale * dpr);
    canvas.height = Math.round(h * scale * dpr);
    canvas.style.width = `${w * scale}px`;
    canvas.style.height = `${h * scale}px`;
    canvas.style.left = `${standX - (margin + cell.feetX) * scale}px`;
    canvas.style.top = `${tileTop - (margin + cell.feetY) * scale + 4}px`;
    ctx.setTransform((canvas.width / w), 0, 0, canvas.height / h, 0, 0); // draw in cell pixels
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
    move.name = name;
    if (name === "sit") seated = true; // set now so a hover ending mid-sit still stands him back up
    if (name === "stand") seated = false;
  };

  const tick = (time) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((time - last) / 1000, 0.05);
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
    const cols = move.cols;
    const sx = (step.f % cols) * cell.w;
    const sy = Math.floor(step.f / cols) * cell.h;
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

  const init = async () => {
    const manifest = await (await fetch("character/tech/manifest.json")).json();
    cell = { w: manifest.cell[0], h: manifest.cell[1], feetX: manifest.feetX, feetY: manifest.feetY, reach: manifest.reach };
    for (const [name, data] of Object.entries(manifest.moves)) moves[name] = prepare(name, data);
    const stand = moves.sit;
    moves.stand = { ...stand, fps: STAND_FPS, steps: [...stand.steps].reverse(), flights: [] };

    await loadSheet("hop", manifest.moves.hop.src);
    stage.appendChild(canvas);
    track.classList.add("is-driven"); // JS owns the track from here
    measure();
    begin("hop");
    start();
    for (const name of ["flip", "sit", "sip"]) await loadSheet(name, manifest.moves[name].src);
  };

  let visible = false;
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !cell) init();
      visible ? start() : stop();
    },
    { rootMargin: "300px 0px" }
  ).observe(stage);

  if (window.matchMedia("(hover: hover)").matches) {
    scroller.addEventListener("mouseenter", () => (hovering = true));
    scroller.addEventListener("mouseleave", () => (hovering = false));
  } else {
    // A tap sits him down for a few seconds; another tap sends him back to hopping
    scroller.addEventListener("click", () => (restUntil = wantsRest() ? 0 : clock + REST_ON_TAP));
  }

  window.addEventListener("resize", () => cell && measure());
  document.fonts?.ready.then(() => cell && measure());
});
