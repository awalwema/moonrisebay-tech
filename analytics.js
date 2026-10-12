// Analytics: GA4 + business CTA events.
// Set GA_MEASUREMENT_ID to the site's GA4 web stream ID (G-XXXXXXXXXX). Empty = tracking off.
const GA_MEASUREMENT_ID = "G-NYJQ4SH9QB";

window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

if (GA_MEASUREMENT_ID) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

// Shared helper so main.js (project modal) can report events too
window.mbTrack = (event, params = {}) => {
  if (GA_MEASUREMENT_ID) gtag("event", event, params);
};

// Classify a link into a business event, or null if it isn't one
function linkEvent(href) {
  if (href.includes("calendly.com")) return "book_call_click";
  if (href.startsWith("mailto:")) return "email_click";
  if (href.endsWith(".pdf")) return "resume_download";
  if (href.includes("linkedin.com")) return "linkedin_click";
  if (/^https?:/.test(href) && !href.includes(location.hostname)) return "outbound_click";
  return null;
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  const event = linkEvent(href);
  if (!event) return;
  const section = link.closest("[data-section]");
  window.mbTrack(event, {
    section: section ? section.dataset.section : "nav",
    link_text: link.textContent.trim().replace(/\s+/g, " ").slice(0, 60),
    link_url: href,
  });
});

// Fire once per section when it reaches mid-screen (how far people actually get).
// rootMargin instead of a visibility ratio, since some sections are taller than the viewport on mobile.
document.addEventListener("DOMContentLoaded", () => {
  const seen = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const name = entry.target.dataset.section;
        if (!entry.isIntersecting || seen.has(name)) return;
        seen.add(name);
        window.mbTrack("section_view", { section: name });
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -50% 0px" }
  );
  document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
});
