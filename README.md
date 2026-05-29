# The Archive — Editorial Magazine

An interactive digital magazine and editorial archive featuring high-fidelity typography, tactile layouts, immersive audio beds, and fluid GSAP-powered motion choreography.

---

## 🎨 Visual Philosophy & Design Identity

The Archive is designed with a premium, high-contrast digital editorial style that is minimalist, structured, and visually compelling:

- **Brutalist Display Typography**: Leveraging strong, uppercase display typography pairings with tight letter spacing (`tracking-tighter`) and crisp margins to mimic high-end physical print design.
- **Atmospheric Dark Canvas**: Dominated by a rich cinematic black canvas (`#0A0A0A`) textured with a subtle global interactive grain shader overlay and tactile border structures.
- **Tactile Interactions**: A responsive glassmorphic navigation bar with a smooth backdrop blur (`backdrop-blur-md bg-[#0A0A0A]/70`) paired with a smooth-glide fullscreen menu overlay.
- **Custom Adaptive Cursor**: A sleek, fluid cursor-follower with adaptive label cues ("EXPLORE") that responds gracefully to interactive elements using modern hover-state triggers.

---

## ✨ Core Interactive Features

### 🎬 1. Preloader & Intro Sequence
- On load, an interactive loading sequence with staggered subtitle entrances occurs alongside a dynamic high-fidelity numeric progress tracker.
- Integrates safe Lenis scroll-locking during the intro animation to maintain theatrical storytelling rhythm until content holds complete.

### 📜 2. Scroll-Linked Interactive Typography
- **Manifesto Word Highlight**: Words in the core Editorial section light up and fade individually mapped precisely to the user's vertical scroll scroll-rate.
- **Full-Width Hero Stagger**: Oversized header titles drop in smoothly with customized easing curves.

### 🌐 3. High-Fidelity Motion Choreography
- **Lenis Smooth-Scroll integration**: Provides fluid, inertia-based trackpad/mousewheel scroll mechanics, synced flawlessly with GSAP and ScrollTrigger.
- **Horizontal Photo Essays**: Implements full horizontal scrolling layouts on desktop viewports, mapping vertical scroll gestures to an elegant leftwards structural translation of photo plates.
- **Parallax Layers & Grids**: Beautiful staggered vertical and absolute layered layouts that move at varying velocities to build spatial depth.

### 🎵 4. Atmospheric Audio Bed
- Built-in abstract audio background deck mapped with elegant bottom-pinned magnetic controller buttons.
- Fully features responsive spatial hover indicators and mute state synchronization.

### ⚓ 5. Scroll-Preserved Navigation
- Smart navigation tracking remembers scroll coordinates when leaving and returning directly from sub-detailed article screens.
- Responsive, clean, non-overlapping fullscreen overlay menu targets matching anchor sections dynamically without breaking layout structures.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js App Router (v15+)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Kinetics**: [GSAP (GreenSock Animation Platform)](https://greensock.com/) & [@gsap/react](https://greensock.com/react)
- **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/)
- **Icons & Assets**: [Lucide React](https://lucide.dev/) + High-resolution curated editorial static assets

---

## 📂 Project Structure

```bash
├── app/
│   ├── article/[id]/      # Dynamic page component for reading selected articles
│   ├── api/               # Server-side API endpoints
│   ├── globals.css        # Global CSS variables and styling sheets
│   ├── layout.tsx         # Primary metadata, HTML structures, and global configuration
│   └── page.tsx           # Home page - complete main editorial feed assembly 
├── components/
│   └── AudioController.tsx# Interactive background scoring deck controller
├── lib/
│   ├── data.ts            # Local static magazine contents and article metadata
│   └── utils.ts           # Shared utility and Tailwind configuration classes
├── public/                # System static media files and graphics
└── metadata.json          # Main platform setup and app settings configuration
```

---

## 🚀 Running the Project Locally

To get the development server running locally, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the Project**:
   Open [http://localhost:3000](http://localhost:3000) (or the mapped dev port) in your web browser.

4. **Production Build**:
   To compile and test the production-ready static outputs, use:
   ```bash
   npm run build
   ```
