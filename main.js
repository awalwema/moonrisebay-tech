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

  // Dynamic logo showcase with mobile auto-rotation
  const companyLinks = document.querySelectorAll(".company-link");
  const featuredLogo = document.getElementById("featured-logo");
  const visitSiteBtn = document.getElementById("visit-site-btn");
  const isMobile = window.innerWidth <= 768;

  // Build companies array
  const companies = Array.from(companyLinks).map((link) => ({
    name: link.getAttribute("data-company"),
    logo: link.getAttribute("data-logo"),
    url: link.href,
    element: link,
  }));

  // Function to show company logo and update button
  function showCompanyLogo(index) {
    const company = companies[index];

    // Fade out
    featuredLogo.style.opacity = "0";
    featuredLogo.style.transform = "scale(0.9)";

    setTimeout(() => {
      // Update logo
      featuredLogo.src = company.logo;
      featuredLogo.alt = company.name + " logo";

      // Update visit button URL
      if (visitSiteBtn) {
        visitSiteBtn.href = company.url;
      }

      // Fade in
      featuredLogo.style.opacity = "1";
      featuredLogo.style.transform = "scale(1)";

      // Highlight active company name
      companies.forEach((c) => c.element.classList.remove("active"));
      company.element.classList.add("active");
    }, 200);
  }

  if (isMobile) {
    // Mobile: Auto-rotate with tap override
    let currentIndex = 0;
    let autoRotateInterval;
    let resumeTimeout;

    function startAutoRotate() {
      // Clear any existing interval first
      if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
      }

      autoRotateInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % companies.length;
        showCompanyLogo(currentIndex);
      }, 2500); // Rotate every 2.5 seconds
    }

    // Tap to switch (prevent navigation on mobile)
    companyLinks.forEach((link, index) => {
      link.addEventListener("click", (e) => {
        e.preventDefault(); // Don't navigate on tap

        // Clear existing interval and timeout
        clearInterval(autoRotateInterval);
        if (resumeTimeout) {
          clearTimeout(resumeTimeout);
        }

        // Update to selected company
        currentIndex = index;
        showCompanyLogo(index);

        // Restart auto-rotation after 5 seconds from current selection
        resumeTimeout = setTimeout(() => {
          startAutoRotate();
        }, 5000);
      });
    });

    // Initialize and start
    showCompanyLogo(0);
    startAutoRotate();
  } else {
    // Desktop: Hover behavior (click navigates)
    companyLinks.forEach((link, index) => {
      link.addEventListener("mouseenter", () => {
        showCompanyLogo(index);
      });
    });

    // Initialize first company
    showCompanyLogo(0);
  }

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
      company: "Moonrise Bay Technologies",
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
    tattoome: {
      title: "🎨 TattThat – AI Tattoo Try-On App",
      company: "Moonrise Bay Technologies",
      industry: "Consumer Tech / Creative AI / Growth",
      website:
        "https://apps.apple.com/us/app/tatt-that-ai-tattoo-try-on/id6756681799",
      overview:
        "Founder-built iOS app and production AI backend that lets people preview healed-ink tattoo designs on their own body before booking an appointment. TattThat pairs a SwiftUI app with a FastAPI service, CDN-backed tattoo catalog, server-side AI generation, credit monetization, purchase verification, product analytics, and a TikTok-to-App-Store acquisition funnel that has driven 4.5M+ views.",
      proofStats: [
        {
          icon: "tiktok",
          value: "4.5M+",
          label: "TikTok views",
          detail: "Owned growth channel and demo funnel",
        },
        {
          icon: "growth",
          value: "10k",
          label: "Followers",
          detail: "Grown from zero in roughly 90 days",
        },
        {
          icon: "appStore",
          value: "4.9★",
          label: "App Store",
          detail: "Live iOS app with credit monetization",
        },
        {
          icon: "catalog",
          value: "300+",
          label: "Design catalog",
          detail: "320 live tattoo designs for try-ons",
        },
      ],
      features: [
        "Photorealistic healed-ink tattoo previews on real body photos using Gemini and FAL generation pipelines",
        "SwiftUI placement canvas with drag, scale, rotation, before/after review, saved designs, and custom tattoo conversion",
        "FastAPI backend on a self-hosted Hetzner VPS with async generation jobs, image processing, and CDN delivery",
        "300+ design catalog with remote metadata, localized app-ready previews, search, browse, and trend-informed collections",
        "StoreKit 2 purchase verification and credit ledger with reserve, charge, and release logic so users are never double-charged",
        "14 releases in 5 months, localized in 9 languages, with product analytics and in-app support feedback loops",
        "TikTok acquisition channel built around visual carousel demos, trend analysis, landing-page tracking, and App Store conversion",
      ],
      techStack: ["swift", "gemini", "python", "firebase", "testflight"],
      //   demoVideo: "project-videos/tattoome-demo.mp4",
      heroImage: "project-images/tattthat-store/01-try-on.png",
      galleryMode: "slideshow",
      galleryImages: [
        {
          src: "project-images/tattthat-store/01-try-on.png",
          caption: "Try-on flow",
        },
        {
          src: "project-images/tattthat-store/02-realistic.png",
          caption: "Realistic healed-ink preview",
        },
        {
          src: "project-images/tattthat-store/03-browse.png",
          caption: "Browse the tattoo catalog",
        },
        {
          src: "project-images/tattthat-store/04-create.png",
          caption: "Create a custom design",
        },
        {
          src: "project-images/tattthat-store/05-styles.png",
          caption: "Explore styles and placements",
        },
        {
          src: "project-images/tattthat-store/06-save.png",
          caption: "Save and share favorites",
        },
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
  const modalProof = document.getElementById("modal-proof");
  const modalGallery = document.getElementById("modal-gallery");
  const modalGallerySection = modalGallery.closest(".modal-gallery");
  const modalGallerySlideshow = document.getElementById("modal-gallery-slideshow");
  const slideshowImage = document.getElementById("slideshow-image");
  const slideshowImageButton = document.getElementById("slideshow-image-button");
  const slideshowCaption = document.getElementById("slideshow-caption");
  const slideshowCounter = document.getElementById("slideshow-counter");
  const slideshowDots = document.getElementById("slideshow-dots");
  const slideshowThumbnails = document.getElementById("slideshow-thumbnails");
  const slideshowPrev = document.getElementById("slideshow-prev");
  const slideshowNext = document.getElementById("slideshow-next");
  const modalTechLogos = document.getElementById("modal-tech-logos");
  const modalVideoSection = document.getElementById("modal-video-section");
  const modalVideo = document.getElementById("modal-video");
  const videoPlayOverlay = document.getElementById("video-play-overlay");

  let slideshowImages = [];
  let slideshowIndex = 0;
  let slideshowTimer = null;

  const proofIconMarkup = {
    appStore: `
      <span class="modal-proof-logo app-store-logo" aria-hidden="true">
        <img src="project-images/logos/app-store.png" alt="" />
      </span>
    `,
    tiktok: `
      <span class="modal-proof-logo tiktok-logo" aria-hidden="true">
        <img src="project-images/logos/tiktok.png" alt="" />
      </span>
    `,
    growth: `
      <span class="modal-proof-logo growth-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <path d="M4 17.5 9 12l3.5 3.5L20 7"></path>
          <path d="M15 7h5v5"></path>
        </svg>
      </span>
    `,
    catalog: `
      <span class="modal-proof-logo catalog-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <rect x="4" y="5" width="7" height="7" rx="1.5"></rect>
          <rect x="13" y="5" width="7" height="7" rx="1.5"></rect>
          <rect x="4" y="14" width="7" height="5" rx="1.5"></rect>
          <rect x="13" y="14" width="7" height="5" rx="1.5"></rect>
        </svg>
      </span>
    `,
  };

  function getProofIcon(icon) {
    return proofIconMarkup[icon] || proofIconMarkup.growth;
  }

  function normalizeGalleryImage(image, index) {
    if (typeof image === "string") {
      return {
        src: image,
        caption: `Screenshot ${index + 1}`,
      };
    }

    return {
      src: image.src,
      caption: image.caption || `Screenshot ${index + 1}`,
    };
  }

  function stopSlideshow() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
  }

  function showSlide(index) {
    if (slideshowImages.length === 0) return;

    slideshowIndex =
      (index + slideshowImages.length) % slideshowImages.length;
    const slide = slideshowImages[slideshowIndex];

    slideshowImage.src = slide.src;
    slideshowImage.alt = slide.caption;
    slideshowCaption.textContent = slide.caption;
    slideshowCounter.textContent = `${slideshowIndex + 1} / ${
      slideshowImages.length
    }`;

    slideshowDots
      .querySelectorAll("button")
      .forEach((dot, dotIndex) =>
        dot.classList.toggle("active", dotIndex === slideshowIndex)
      );
    slideshowThumbnails
      .querySelectorAll("button")
      .forEach((thumb, thumbIndex) =>
        thumb.classList.toggle("active", thumbIndex === slideshowIndex)
      );
  }

  function nextSlide() {
    showSlide(slideshowIndex + 1);
  }

  function prevSlide() {
    showSlide(slideshowIndex - 1);
  }

  function startSlideshow() {
    stopSlideshow();
    if (slideshowImages.length <= 1) return;
    slideshowTimer = setInterval(nextSlide, 4500);
  }

  function renderSlideshow(galleryImages) {
    slideshowImages = galleryImages.map(normalizeGalleryImage);
    slideshowIndex = 0;

    slideshowDots.innerHTML = slideshowImages
      .map(
        (slide, index) => `
        <button
          type="button"
          class="slideshow-dot"
          aria-label="Show ${slide.caption}"
          data-slide-index="${index}"
        ></button>
      `
      )
      .join("");

    slideshowThumbnails.innerHTML = slideshowImages
      .map(
        (slide, index) => `
        <button
          type="button"
          class="slideshow-thumbnail"
          aria-label="Show ${slide.caption}"
          data-slide-index="${index}"
        >
          <img src="${slide.src}" alt="${slide.caption}" loading="lazy" />
        </button>
      `
      )
      .join("");

    showSlide(0);
    startSlideshow();
  }

  // Open modal
  function openModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    stopSlideshow();

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

    // Proof stats (if available)
    if (project.proofStats && project.proofStats.length > 0) {
      modalProof.style.display = "grid";
      modalProof.innerHTML = project.proofStats
        .map(
          (stat) => `
        <div class="modal-proof-item">
          ${getProofIcon(stat.icon)}
          <div>
            <p class="modal-proof-value">${stat.value}</p>
            <p class="modal-proof-label">${stat.label}</p>
            <p class="modal-proof-detail">${stat.detail}</p>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      modalProof.style.display = "none";
      modalProof.innerHTML = "";
    }

    // Gallery (hide if no images)
    if (project.galleryImages && project.galleryImages.length > 0) {
      modalGallerySection.style.display = "block";
      if (project.galleryMode === "slideshow") {
        modalGallery.style.display = "none";
        modalGallery.innerHTML = "";
        modalGallerySlideshow.style.display = "block";
        renderSlideshow(project.galleryImages);
      } else {
        modalGallery.style.display = "grid";
        modalGallerySlideshow.style.display = "none";
        modalGallery.innerHTML = project.galleryImages
          .map(normalizeGalleryImage)
          .map(
            (img, i) => `
        <div class="gallery-item">
          <img src="${img.src}" alt="${img.caption || `Screenshot ${i + 1}`}" />
        </div>
      `
          )
          .join("");
      }
    } else {
      modalGallerySection.style.display = "none";
      modalGallerySlideshow.style.display = "none";
      modalGallery.innerHTML = "";
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
    stopSlideshow();
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

  slideshowPrev.addEventListener("click", () => {
    prevSlide();
    startSlideshow();
  });

  slideshowNext.addEventListener("click", () => {
    nextSlide();
    startSlideshow();
  });

  slideshowImageButton.addEventListener("click", () => {
    if (slideshowImages.length > 0) {
      openLightbox(
        slideshowImages.map((slide) => slide.src),
        slideshowIndex
      );
    }
  });

  modalGallerySlideshow.addEventListener("mouseenter", stopSlideshow);
  modalGallerySlideshow.addEventListener("mouseleave", startSlideshow);

  modalGallerySlideshow.addEventListener("click", (e) => {
    const target = e.target.closest("[data-slide-index]");
    if (!target) return;

    showSlide(Number(target.getAttribute("data-slide-index")));
    startSlideshow();
  });

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

  // Sticky nav: show after scrolling past the hero
  const siteNav = document.getElementById("site-nav");
  const heroSection = document.querySelector("header");

  if (siteNav && heroSection) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          siteNav.classList.remove("visible");
        } else {
          siteNav.classList.add("visible");
        }
      },
      { threshold: 0 }
    );
    observer.observe(heroSection);
  }

  console.log("Moonrise Bay Technologies loaded.");
});
