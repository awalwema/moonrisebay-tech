# Project Modal System - Usage Guide

## Overview

Your site now has interactive project modals! Click any project card to open a full-screen portfolio showcase.

## How It Works

1. **Click a project card** → Modal opens with full project details
2. **Close with:**
   - X button (top right)
   - Click outside the modal
   - ESC key

## Adding Your Real Media

### 1. Add Demo Videos (Optional)

Place your MP4 demo videos in `/project-videos/`:

**Videos:**
- `hearlabs-demo.mp4` - 30-60 second demo (under 10MB)
- `sipandscroll-demo.mp4`
- `faithfilter-demo.mp4`

**Tips:**
- Keep videos short (30-60 seconds)
- Show the core feature/workflow
- No loading screens - start with app open
- 1080p or 720p resolution
- Compress to keep under 10MB

**If you don't have a video for a project:**
Just don't add the video file - the modal will automatically skip the video section and show the gallery instead!

### 2. Add Project Screenshots

Place your images in `/project-images/`:

**HearLabs:**
- `hearlabs-hero.png` - Main showcase image (1200×800px recommended)
- `hearlabs-1.png`, `hearlabs-2.png`, `hearlabs-3.png` - Gallery images

**Sip & Scroll:**
- `sipandscroll-hero.png`
- `sipandscroll-1.png` through `sipandscroll-4.png`

**FaithFilter:**
- `faithfilter-hero.png`
- `faithfilter-1.png`, `faithfilter-2.png`

### 3. Add Tech Logos

Place tech stack logos in `/tech-logos/`:

Common ones you'll need:
- `swift.png` (or .svg)
- `firebase.png`
- `react.png`
- `nextjs.png`
- `openai.png`
- `postgresql.png`
- `pinecone.png`
- `swiftui.png`
- `coreml.png`

### 4. Update the JavaScript

Open `main.js` and find the `projectData` object (around line 28).

**Update image paths:**

```javascript
// Change this:
heroImage: "project-images/hearlabs-hero.png",

// When you add real images, paths stay the same!
// Just make sure filenames match
```

**Update tech logos:**

```javascript
// In main.js, find where it generates tech logos (around line 135)
// Replace the placeholder code with:

modalTechLogos.innerHTML = project.techStack
  .map(
    (tech) => `
    <div class="tech-logo-item">
      <img src="tech-logos/${tech}.png" alt="${tech}" />
    </div>
  `
  )
  .join("");
```

**Update hero and gallery images:**

```javascript
// Around line 126, change hero image:
modalHero.src = project.heroImage; // Will use real path now

// Around line 130, change gallery:
modalGallery.innerHTML = project.galleryImages
  .map(
    (img, i) => `
    <div class="gallery-item">
      <img src="${img}" alt="Screenshot ${i + 1}" />
    </div>
  `
  )
  .join("");
```

## Editing Project Content

All project data is in `main.js` in the `projectData` object:

```javascript
hearlabs: {
  title: "🔊 HearLabs – Smart TV Audio iOS App",
  company: "HearLabs",
  industry: "Consumer Tech / Audio",  // Edit this
  website: "https://www.hearlabs.com/",  // Update link
  overview: "Your project description...",  // Edit description
  features: [  // Edit feature list
    "Feature 1",
    "Feature 2",
  ],
  techStack: ["swift", "firebase"],  // Add/remove tech
  demoVideo: "project-videos/hearlabs-demo.mp4",  // Optional - remove if no video
  heroImage: "project-images/hearlabs-hero.png",
  galleryImages: [  // Add/remove gallery images
    "project-images/hearlabs-1.png",
  ],
}
```

## Adding New Projects

1. Add a new project card in `index.html`
2. Add project data to `projectData` in `main.js`
3. Add images to `/project-images/`
4. Use the same structure as existing projects

## Industries You Can Use

- Consumer Tech
- Faith Tech
- Real Estate
- Video Tech
- B2B SaaS
- FinTech
- Health & Wellness
- EdTech

## Tips

- Use consistent image sizes for a polished look
- Hero images: 1200×800px (16:9 ratio)
- Gallery images: 600×400px minimum
- Tech logos: 128×128px square, transparent background
- Keep descriptions clear and outcome-focused
- Lead with the problem you solved, not just features

