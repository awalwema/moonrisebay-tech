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
      techStack: ["swift", "firebase", "bluetooth", "testflight"],
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
      techStack: ["swift", "coreml", "gemini", "ultralytics"],
      //   demoVideo: "project-videos/sipandscroll-demo.mp4", // Add your video here
      heroImage: "project-images/sipandscroll-hero.png",
      galleryImages: [
        "project-images/sipandscroll-1.png",
        "project-images/sipandscroll-2.png",
        "project-images/sipandscroll-3.png",
        "project-images/sipandscroll-4.png",
        "project-images/sipandscroll-5.png",
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
        "digitalOcean",
      ],
      //   demoVideo: "project-videos/faithfilter-demo.mp4",
      heroImage: "project-images/faithfilter-hero.png",
      galleryImages: [
        "project-images/faithfilter-1.png",
        "project-images/faithfilter-2.png",
        "project-images/faithfilter-3.png",
        "project-images/faithfilter-4.png",
        "project-images/faithfilter-5.png",
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

    // Tech stack logos - single row with seamless scroll
    const techLogosHTML = project.techStack
      .map(
        (tech) => `
        <div class="tech-logo-item">
          <img src="tech-logos/${tech}.svg" alt="${tech}" onerror="this.onerror=null; this.src='tech-logos/${tech}.png'; this.onerror=function(){this.src='https://via.placeholder.com/48x48/e5e7eb/4a90c5?text=${tech[0].toUpperCase()}'}" />
          <span class="tech-logo-name">${tech}</span>
        </div>
      `
      )
      .join("");
    // Duplicate once for infinite scroll effect
    modalTechLogos.innerHTML = techLogosHTML + techLogosHTML;

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

  // Tech stack auto-scroll (no manual controls needed)

  // Image Lightbox System
  const lightbox = document.getElementById("image-lightbox");
  const lightboxOverlay = lightbox.querySelector(".lightbox-overlay");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const lightboxPrev = lightbox.querySelector(".lightbox-prev");
  const lightboxNext = lightbox.querySelector(".lightbox-next");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCounter = document.getElementById("lightbox-counter");

  let currentImages = [];
  let currentImageIndex = 0;

  function openLightbox(images, startIndex) {
    currentImages = images;
    currentImageIndex = startIndex;
    showLightboxImage();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    // Keep modal scroll locked (we're going back to modal, not closing it)
    // Modal already has overflow: hidden set
  }

  function showLightboxImage() {
    lightboxImage.src = currentImages[currentImageIndex];
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${
      currentImages.length
    }`;
  }

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    showLightboxImage();
  }

  function prevImage() {
    currentImageIndex =
      (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    showLightboxImage();
  }

  // Lightbox event listeners
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxOverlay.addEventListener("click", closeLightbox);
  lightboxNext.addEventListener("click", (e) => {
    e.stopPropagation();
    nextImage();
  });
  lightboxPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    prevImage();
  });

  // Click on lightbox content area (outside image) closes lightbox
  lightbox.querySelector(".lightbox-content").addEventListener("click", (e) => {
    // Only close if clicking directly on the content area, not on buttons or image
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  });

  // Prevent image from being selected/highlighted
  lightboxImage.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  // Keyboard navigation for lightbox
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("active")) {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    }
  });

  // Delegate click events for gallery images (since they're dynamically added)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".gallery-item img")) {
      const clickedImg = e.target;
      const galleryItems = Array.from(
        document.querySelectorAll(".gallery-item img")
      );
      const imageUrls = galleryItems.map((img) => img.src);
      const clickedIndex = galleryItems.indexOf(clickedImg);
      openLightbox(imageUrls, clickedIndex);
    }
  });

  // Home Tech Stack Carousel
  const homeTechLogos = document.getElementById("home-tech-logos");

  if (homeTechLogos) {
    // Curated tech stack showing breadth across web, mobile, AI, cloud
    // Curated tech stack showing breadth across web, mobile, AI, cloud
    const techStackList = [
      // Modern Web Stack (most common startup need)
      { name: "React", image: "tech-logos/react.png" },
      { name: "Next.js", image: "tech-logos/nextjs.png" },

      // Startup-Friendly Backend (easy to use, scalable)
      { name: "Firebase", image: "tech-logos/firebase.svg" },
      { name: "Supabase", image: "tech-logos/supabase.png" },

      // AI/ML (hot & differentiating)
      { name: "OpenAI", image: "tech-logos/openai.png" },
      { name: "Gemini AI", image: "tech-logos/gemini.png" },
      { name: "Pinecone", image: "tech-logos/pinecone.png" },

      // Mobile (native iOS)
      { name: "Swift", image: "tech-logos/swift.png" },

      // Languages (shows versatility)
      { name: "Python", image: "tech-logos/python.png" },
      { name: "Java", image: "tech-logos/java.png" },

      // Cloud & DevOps (credibility)
      { name: "AWS", image: "tech-logos/aws.png" },
      { name: "Google Cloud", image: "tech-logos/gcp.png" },
      { name: "DigitalOcean", image: "tech-logos/digitalOcean.png" },
      { name: "Docker", image: "tech-logos/docker.png" },
      { name: "Kubernetes", image: "tech-logos/kubernetes.png" },

      { name: "PostgreSQL", image: "tech-logos/postgres.png" },
      { name: "MySQL", image: "tech-logos/mysql.png" },
      { name: "MongoDB", image: "tech-logos/mongodb.png" },
      { name: "Redis", image: "tech-logos/redis.png" },
      { name: "Elasticsearch", image: "tech-logos/elasticsearch.png" },
      //   { name: "Kibana", image: "tech-logos/kibana.png" },
      //   { name: "Logstash", image: "tech-logos/logstash.png" },
      //   { name: "Fluentd", image: "tech-logos/fluentd.png" },

      // Specialized (niche but impressive)
      { name: "Bluetooth", image: "tech-logos/bluetooth.svg" },
      { name: "CoreML", image: "tech-logos/coreml.png" },
      { name: "Ultralytics", image: "tech-logos/ultralytics.png" },
      { name: "Oracle Cloud", image: "tech-logos/oci.png" },
    ];

    // Duplicate the array twice to create seamless infinite scroll
    const duplicatedTech = [...techStackList, ...techStackList];

    // Render tech items
    duplicatedTech.forEach((tech) => {
      const techItem = document.createElement("div");
      techItem.className = "home-tech-item";

      const img = document.createElement("img");
      img.src = tech.image;
      img.alt = tech.name;
      img.loading = "lazy";

      const name = document.createElement("span");
      name.className = "home-tech-name";
      name.textContent = tech.name;

      techItem.appendChild(img);
      techItem.appendChild(name);
      homeTechLogos.appendChild(techItem);
    });
  }

  console.log("Moonrise Bay Technologies loaded.");
});
