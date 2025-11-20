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

  // Dynamic logo showcase on hover
  const companyLinks = document.querySelectorAll(".company-link");
  const featuredLogo = document.getElementById("featured-logo");

  companyLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const logoSrc = link.getAttribute("data-logo");
      const companyName = link.getAttribute("data-company");

      // Fade out, change, fade in
      featuredLogo.style.opacity = "0";
      featuredLogo.style.transform = "scale(0.8)";

      setTimeout(() => {
        featuredLogo.src = logoSrc;
        featuredLogo.alt = companyName + " logo";
        featuredLogo.style.opacity = "1";
        featuredLogo.style.transform = "scale(1)";
      }, 200);
    });
  });

  console.log("Moonrise Bay Technologies loaded.");
});
