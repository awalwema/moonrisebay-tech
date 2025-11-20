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

  // Project Modal System
  const projectData = {
    hearlabs: {
      title: "🔊 HearLabs – Smart TV Audio iOS App",
      company: "HearLabs",
      industry: "Consumer Tech / Audio",
      website: "https://www.hearlabs.com/",
      overview:
        "Developed an iOS app for an innovative TV audio startup that gained attention at CES. The app pairs with their smart device to manage TV audio settings via Bluetooth. Implemented complete user account system with Firebase, integrated with the company's Wix platform, and deployed through TestFlight. The project showcases full Apple ecosystem knowledge from development through App Store preparation.",
      features: [
        "Audio preference control for the TV audio device",
        "Cloud-based profile management with Firebase",
        "Secure authentication and account system",
        "Seamless integration with HearLabs' Wix community platform",
        "Native iOS app with Bluetooth connectivity",
        "TestFlight beta deployment and App Store submission pipeline",
        "Clean, intuitive interface design",
      ],
      techStack: ["swift", "firebase", "bluetooth", "testflight", "wix"],
      demoVideo: "project-videos/hearlabs-demo.mp4",
      heroImage: "project-images/hearlabs-hero.png",
      galleryImages: [
        "project-images/hearlabs-1.jpeg",
        // "project-images/hearlabs-2.png",
        // "project-images/hearlabs-3.png",
      ],
    },
    sipandscroll: {
      title: "💧 Sip & Scroll – Behavior Hydration App",
      company: "Sip & Scroll",
      industry: "Consumer Tech / Wellness",
      website: "https://sipandscroll.app/",
      overview:
        "Founder-built iOS app that combines AI vision technology with behavior modification to help users develop healthy hydration habits. The app blocks access to social media until users verify they've had water by taking a 'water selfie', turning phone addiction into a hydration reminder system.",
      features: [
        "AI vision to verify water selfies before unlocking apps",
        "Smart app blocking for social media platforms",
        "Habit tracking with daily and weekly insights",
        "Customizable hydration goals and reminders",
        "Beautiful data visualizations and progress tracking",
      ],
      techStack: ["swift", "coreml", "swiftui", "firebase"],
      demoVideo: "project-videos/sipandscroll-demo.mp4", // Add your video here
      heroImage: "project-images/sipandscroll-hero.png",
      galleryImages: [
        "project-images/sipandscroll-1.png",
        "project-images/sipandscroll-2.png",
        "project-images/sipandscroll-3.png",
        "project-images/sipandscroll-4.png",
      ],
    },
    faithfilter: {
      title: "🧠 FaithFilter – AI Media Discovery Platform",
      company: "FaithFilter",
      industry: "Faith Tech / Content Discovery",
      website: "https://faithfilter.com/",
      overview:
        "Built an AI-powered media platform for Christian communities that integrates a custom vector search engine, automated podcast ingestion, and a no-code-friendly admin dashboard. The platform helps users explore books, podcasts, and videos with smarter AI-powered search and intuitive, editor-friendly tools.",
      features: [
        "LLM-powered search that understands meaning, not just keywords (e.g., 'books on courage')",
        "Automated daily imports of podcast content with metadata & indexing",
        "Admin dashboard for curators to manage, edit, and tag resources with no tech skill required",
        "Custom CMS for uploading books, podcasts, and videos with preview support",
        "Public-facing site with homepage, category browsing, and detailed content views",
        "React dashboard with sortable tables, tag editors, and CSV export",
        "Deployed to DigitalOcean with custom domain + staging environment",
      ],
      techStack: [
        "react",
        "nextjs",
        "openai",
        "supabase",
        "pinecone",
        "digitalocean",
      ],
      //   demoVideo: "project-videos/faithfilter-demo.mp4",
      heroImage: "project-images/faithfilter-hero.png",
      galleryImages: [
        "project-images/faithfilter-1.png",
        "project-images/faithfilter-2.png",
      ],
    },
  };

  // Modal Elements
  const modal = document.getElementById("project-modal");
  const modalOverlay = modal.querySelector(".modal-overlay");
  const modalClose = modal.querySelector(".modal-close");
  const projectCards = document.querySelectorAll(".project-card");

  // Modal Content Elements
  const modalTitle = document.getElementById("modal-title");
  const modalCompany = document.getElementById("modal-company");
  const modalIndustry = document.getElementById("modal-industry");
  const modalWebsiteLink = document.getElementById("modal-website-link");
  const modalOverview = document.getElementById("modal-overview");
  const modalFeatures = document.getElementById("modal-features");
  const modalHero = document.getElementById("modal-hero");
  const modalGallery = document.getElementById("modal-gallery");
  const modalGallerySection = modalGallery.closest(".modal-gallery");
  const modalTechLogos = document.getElementById("modal-tech-logos");
  const modalVideoSection = document.getElementById("modal-video-section");
  const modalVideo = document.getElementById("modal-video");
  const videoPlayOverlay = document.getElementById("video-play-overlay");

  // Open modal
  function openModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;

    // Populate modal content
    modalTitle.textContent = project.title;
    modalCompany.textContent = project.company;
    modalIndustry.textContent = project.industry;
    modalWebsiteLink.href = project.website;
    modalOverview.textContent = project.overview;

    // Features
    modalFeatures.innerHTML = project.features
      .map((feature) => `<li>${feature}</li>`)
      .join("");

    // Hero image
    modalHero.src = project.heroImage;
    modalHero.alt = project.title;

    // Gallery (hide if no images)
    if (project.galleryImages && project.galleryImages.length > 0) {
      modalGallerySection.style.display = "block";
      modalGallery.innerHTML = project.galleryImages
        .map(
          (img, i) => `
        <div class="gallery-item">
          <img src="${img}" alt="Screenshot ${i + 1}" />
        </div>
      `
        )
        .join("");
    } else {
      modalGallerySection.style.display = "none";
    }

    // Tech stack logos (placeholders for now)
    modalTechLogos.innerHTML = project.techStack
      .map(
        (tech) => `
        <div class="tech-logo-item">
          <img src="https://via.placeholder.com/48x48/e5e7eb/4a90c5?text=${tech[0].toUpperCase()}" alt="${tech}" />
        </div>
      `
      )
      .join("");

    // Demo video (if available)
    if (project.demoVideo) {
      modalVideoSection.style.display = "block";
      modalVideo.src = project.demoVideo;
      modalVideo.load();
      videoPlayOverlay.classList.remove("hidden");
      modalVideo.pause();
    } else {
      modalVideoSection.style.display = "none";
    }

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Close modal
  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    // Pause and reset video
    if (modalVideo.src) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      videoPlayOverlay.classList.remove("hidden");
    }
  }

  // Event listeners
  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const projectId = card.getAttribute("data-project");
      openModal(projectId);
    });
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  // Video play button
  videoPlayOverlay.addEventListener("click", () => {
    modalVideo.play();
    videoPlayOverlay.classList.add("hidden");
  });

  // Show play button if video is paused
  modalVideo.addEventListener("pause", () => {
    if (modalVideo.currentTime === 0 || modalVideo.ended) {
      videoPlayOverlay.classList.remove("hidden");
    }
  });

  // Hide play button when video plays
  modalVideo.addEventListener("play", () => {
    videoPlayOverlay.classList.add("hidden");
  });

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Tech stack carousel
  const carouselPrev = modal.querySelector(".carousel-prev");
  const carouselNext = modal.querySelector(".carousel-next");
  let carouselPosition = 0;

  carouselNext.addEventListener("click", () => {
    const techLogosEl = document.getElementById("modal-tech-logos");
    const maxScroll =
      techLogosEl.scrollWidth - techLogosEl.parentElement.offsetWidth;
    carouselPosition = Math.min(carouselPosition + 60, maxScroll);
    techLogosEl.style.transform = `translateX(-${carouselPosition}px)`;
  });

  carouselPrev.addEventListener("click", () => {
    const techLogosEl = document.getElementById("modal-tech-logos");
    carouselPosition = Math.max(carouselPosition - 60, 0);
    techLogosEl.style.transform = `translateX(-${carouselPosition}px)`;
  });

  console.log("Moonrise Bay Technologies loaded.");
});
