// Fade in sections on load
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section, header");
  sections.forEach((section, index) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    setTimeout(() => {
      section.style.opacity = "1";
      section.style.transform = "translateY(0)";
    }, index * 100);
  });

  console.log("Moonrise Bay Technologies loaded.");
});
