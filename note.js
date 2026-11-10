// "Send a Note": a short form that lands in Andrew's Telegram via api.moonrisebay.tech.
// If that can't be reached, it offers the same note by email. Without JS, the link is a plain mailto.
(() => {
  const ENDPOINT = "https://api.moonrisebay.tech/v1/note";
  const EMAIL = "andrew@moonrisebay.tech";
  const dialog = document.getElementById("note-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return; // very old browsers keep the mailto

  const form = dialog.querySelector(".note-form");
  const done = dialog.querySelector(".note-done");
  const status = dialog.querySelector(".note-status");
  const send = form.querySelector(".note-send");
  let openedAt = 0;
  let topic = "";

  const track = (event, params = {}) => window.mbTrack?.(event, { topic, ...params });

  function open(link) {
    topic = link.dataset.note || "";
    form.hidden = false;
    done.hidden = true;
    status.textContent = "";
    status.className = "note-status";
    send.disabled = false;
    send.textContent = "Send note";
    openedAt = performance.now();
    dialog.showModal();
    form.elements.name.focus();
    track("note_open");
  }

  function mailto() {
    const f = form.elements;
    const body = `${f.message.value.trim()}\n\n${f.name.value.trim()}`;
    return `mailto:${EMAIL}?subject=${encodeURIComponent(topic || "Hello")}&body=${encodeURIComponent(body)}`;
  }

  function fail(text) {
    status.className = "note-status is-error";
    status.innerHTML = "";
    status.append(`${text} `);
    const a = document.createElement("a");
    a.href = mailto();
    a.textContent = "Email it instead";
    status.append(a);
    send.disabled = false;
    send.textContent = "Try again";
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-note]");
    if (link) {
      e.preventDefault();
      open(link);
    } else if (e.target.closest("[data-note-close]")) {
      dialog.close();
    }
  });
  // Click on the backdrop closes it
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements;
    const missing = ["name", "email", "message"].find((k) => !f[k].value.trim() || !f[k].checkValidity());
    if (missing) {
      status.className = "note-status is-error";
      status.textContent = missing === "email" ? "That email doesn't look right." : `Please add your ${missing}.`;
      f[missing].focus();
      return;
    }
    send.disabled = true;
    send.textContent = "Sending…";
    status.className = "note-status";
    status.textContent = "";
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.value,
          email: f.email.value,
          message: (topic ? `[${topic}] ` : "") + f.message.value,
          website: f.website.value,
          elapsed: Math.round(performance.now() - openedAt),
          page: location.pathname + location.hash,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      dialog.querySelector(".note-done-email").textContent = f.email.value.trim();
      form.hidden = true;
      done.hidden = false;
      form.reset();
      track("note_sent");
    } catch (err) {
      fail(err.message === "429" ? "Too many notes from here just now." : "Couldn't send that right now.");
      track("note_failed", { reason: err.message.slice(0, 40) });
    }
  });
})();
