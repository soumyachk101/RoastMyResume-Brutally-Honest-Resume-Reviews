# 🎨 RoastMyResume.com — UI/UX Design & Premium Animation Specification

## 1. Design Philosophy

> **"Premium, Playful, Powerful"**
> A dark-mode-first design that feels like a high-end SaaS product with the
> personality of a late-night comedy show. Every interaction should feel smooth,
> intentional, and delightful.

### Design Principles
1. **Dark Mode First** — Rich, deep backgrounds that make colors pop
2. **Motion with Purpose** — Every animation communicates state or guides attention
3. **Glassmorphism + Depth** — Layered cards with blur and glow effects
4. **Fire as Brand Identity** — 🔥 Fire/flame motifs throughout (colors, particles, icons)
5. **Micro-interactions Everywhere** — Buttons, cards, scores — everything responds to interaction
6. **Accessibility Always** — Animations respect `prefers-reduced-motion`

---

## 2. Color System

### Primary Palette (Dark Mode)

```css
:root {
  /* ═══ BACKGROUNDS ═══ */
  --bg-primary:       #0A0A0F;      /* Near-black with blue undertone */
  --bg-secondary:     #12121A;      /* Slightly lighter */
  --bg-tertiary:      #1A1A2E;      /* Card backgrounds */
  --bg-elevated:      #222238;      /* Elevated surfaces */

  /* ═══ FIRE GRADIENT (Brand) ═══ */
  --fire-red:         #FF4D4D;      /* Hot red */
  --fire-orange:      #FF6B35;      /* Burning orange */
  --fire-yellow:      #FFD166;      /* Flame tip yellow */
  --fire-gradient:    linear-gradient(135deg, #FF4D4D, #FF6B35, #FFD166);
  
  /* ═══ ACCENT COLORS ═══ */
  --accent-primary:   #6C63FF;      /* Electric purple */
  --accent-secondary: #00D4AA;      /* Mint green (success) */
  --accent-warning:   #FFB347;      /* Warm amber */
  --accent-info:      #4DA8FF;      /* Bright blue */
  
  /* ═══ TEXT ═══ */
  --text-primary:     #FFFFFF;      /* Pure white */
  --text-secondary:   #A0A0B8;      /* Muted lavender */
  --text-tertiary:    #6B6B80;      /* Subtle text */
  --text-fire:        transparent;   /* Use with fire gradient + bg-clip */
  
  /* ═══ SCORE COLORS ═══ */
  --score-terrible:   #FF4D4D;      /* 0–20 */
  --score-poor:       #FF6B35;      /* 21–40 */
  --score-average:    #FFD166;      /* 41–60 */
  --score-good:       #4DA8FF;      /* 61–80 */
  --score-excellent:  #00D4AA;      /* 81–100 */
  
  /* ═══ GLASSMORPHISM ═══ */
  --glass-bg:         rgba(255, 255, 255, 0.05);
  --glass-border:     rgba(255, 255, 255, 0.10);
  --glass-blur:       20px;
  
  /* ═══ GLOW EFFECTS ═══ */
  --glow-fire:        0 0 30px rgba(255, 77, 77, 0.3);
  --glow-purple:      0 0 30px rgba(108, 99, 255, 0.3);
  --glow-success:     0 0 30px rgba(0, 212, 170, 0.3);
}
```

### Light Mode Overrides

```css
[data-theme="light"] {
  --bg-primary:       #FAFAFA;
  --bg-secondary:     #F5F5F7;
  --bg-tertiary:      #FFFFFF;
  --bg-elevated:      #FFFFFF;
  --text-primary:     #1A1A2E;
  --text-secondary:   #6B6B80;
  --glass-bg:         rgba(255, 255, 255, 0.70);
  --glass-border:     rgba(0, 0, 0, 0.08);
}
```

---

## 3. Typography

```css
/* Primary: Inter — Clean, modern, excellent readability */
/* Display: Cal Sans — Bold, distinctive headings */
/* Mono: JetBrains Mono — Code snippets, scores */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --font-sans:    'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Cal Sans', 'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
}

/* Type Scale */
.text-hero     { font-size: 4.5rem;  line-height: 1.1; font-weight: 900; letter-spacing: -0.03em; }
.text-h1       { font-size: 3rem;    line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; }
.text-h2       { font-size: 2rem;    line-height: 1.3; font-weight: 700; }
.text-h3       { font-size: 1.5rem;  line-height: 1.4; font-weight: 600; }
.text-body-lg  { font-size: 1.125rem; line-height: 1.6; font-weight: 400; }
.text-body     { font-size: 1rem;    line-height: 1.6; font-weight: 400; }
.text-small    { font-size: 0.875rem; line-height: 1.5; font-weight: 400; }
.text-caption  { font-size: 0.75rem; line-height: 1.4; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
```

---

## 4. Component Design Tokens

### Glassmorphism Card

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: var(--glow-purple);
  transform: translateY(-2px);
}
```

### Fire Gradient Text

```css
.fire-text {
  background: var(--fire-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Magnetic Button

```css
.magnetic-btn {
  position: relative;
  background: var(--fire-gradient);
  color: white;
  font-weight: 600;
  padding: 14px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.magnetic-btn:hover {
  box-shadow: var(--glow-fire);
  transform: scale(1.02);
}

/* Shimmer effect on hover */
.magnetic-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.magnetic-btn:hover::after {
  transform: translateX(100%);
}
```

---

## 5. Animation Specification

### 5.1 Global Animation Tokens

```typescript
// Framer Motion transition presets
export const transitions = {
  // Smooth, natural easing
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
  springGentle: { type: 'spring', stiffness: 200, damping: 30 },
  
  // Tween easings
  easeOut: { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.4 },
  easeInOut: { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.6 },
  
  // Stagger children
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  },
};

// Reduced motion fallback
export const safeAnimate = (animation: object) => ({
  ...animation,
  '@media (prefers-reduced-motion: reduce)': {
    transition: { duration: 0 },
  },
});
```

### 5.2 Page-Level Animations

#### Landing Page — Hero Section
```typescript
// Hero text reveal: Letters stagger in from bottom with opacity
const heroTextVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom cubic bezier
    },
  }),
};

// 3D floating resume mock that rotates on mouse move
// Uses React Three Fiber for WebGL rendering
const HeroScene = () => (
  <Canvas>
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <ResumeModel />
    </Float>
    <FireParticles count={200} />
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} color="#FF4D4D" />
  </Canvas>
);

// Animated gradient background with moving mesh
// CSS Keyframes for performance
const meshGradient = `
@keyframes meshMove {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.mesh-bg {
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(108, 99, 255, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255, 77, 77, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(0, 212, 170, 0.1) 0%, transparent 50%),
    var(--bg-primary);
  background-size: 200% 200%;
  animation: meshMove 15s ease-in-out infinite;
}
`;
```

#### Upload Flow — Drag & Drop Zone
```typescript
// Dropzone animations
const dropzoneVariants = {
  idle: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    scale: 1,
  },
  hover: {
    borderColor: 'rgba(108, 99, 255, 0.5)',
    scale: 1.02,
    boxShadow: '0 0 40px rgba(108, 99, 255, 0.2)',
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  active: {
    borderColor: 'rgba(255, 77, 77, 0.7)',
    scale: 1.05,
    boxShadow: '0 0 60px rgba(255, 77, 77, 0.3)',
  },
  accepted: {
    borderColor: 'rgba(0, 212, 170, 0.7)',
    scale: 1,
    boxShadow: '0 0 40px rgba(0, 212, 170, 0.2)',
  },
};

// File icon morphs into flame when dropped
// Lottie animation: document-to-flame.json
```

#### Processing State — Roast In Progress
```typescript
// Multi-stage loading animation
const processingStages = [
  { message: "📄 Reading your resume...",           duration: 1500 },
  { message: "🔍 Analyzing your 'skills'...",       duration: 2000 },
  { message: "🔥 Heating up the roast...",          duration: 2000 },
  { message: "👨‍🍳 Chef Roast is reviewing...",      duration: 2000 },
  { message: "💀 Preparing your brutal truth...",   duration: 1500 },
  { message: "✨ Adding finishing touches...",       duration: 1000 },
];

// Flame particles around a rotating document
// Progress bar with fire gradient fill
// Stage messages fade in/out with typewriter effect
```

#### Results Page — Score Reveal
```typescript
// Dramatic score reveal sequence
const scoreRevealSequence = {
  step1_darken: {
    // Background dims, spotlight on score
    duration: 500,
  },
  step2_countUp: {
    // Number counts from 0 → actual score
    // Speed: fast at start, slows near final number
    // Color changes dynamically based on score range
    duration: 2000,
    easing: [0.34, 1.56, 0.64, 1], // Overshoot
  },
  step3_title: {
    // Roast title types in character by character
    // Like a typewriter with blinking cursor
    duration: 1500,
  },
  step4_sections: {
    // Section cards stagger in from bottom
    stagger: 150, // ms between each card
    animation: { opacity: [0, 1], y: [30, 0], scale: [0.95, 1] },
  },
  step5_celebration: {
    // If score > 80: Confetti explosion
    // If score < 30: Screen shake + sad trombone
    // If score 30-80: Subtle particle burst
  },
};

// Score ring animation (circular progress)
const ScoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 60; // radius = 60
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <motion.svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70" cy="70" r="60"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="8"
        fill="none"
      />
      <motion.circle
        cx="70" cy="70" r="60"
        stroke={getScoreColor(score)}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </motion.svg>
  );
};
```

### 5.3 Micro-Interactions

```typescript
// Button hover: Magnetic effect (follows cursor slightly)
const MagneticButton = ({ children }) => {
  const ref = useRef<HTMLButtonElement>(null);
  
  const handleMouseMove = (e: MouseEvent) => {
    const btn = ref.current!;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };
  
  const handleMouseLeave = () => {
    ref.current!.style.transform = 'translate(0, 0)';
  };
  
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      className="magnetic-btn"
    >
      {children}
    </motion.button>
  );
};

// Card hover: 3D tilt effect
const TiltCard = ({ children }) => (
  <motion.div
    whileHover={{
      rotateX: -5,
      rotateY: 5,
      transition: { type: 'spring', stiffness: 300 },
    }}
    style={{ transformPerspective: 1000 }}
    className="glass-card"
  >
    {children}
  </motion.div>
);

// Score change: Number morphs with spring animation
// Tab switch: Content slides with crossfade
// Toast notification: Slides in from top-right with bounce
// Sidebar menu: Staggered item reveal on open
// Delete confirmation: Card shrinks + fades with red glow
```

### 5.4 Scroll-Based Animations

```typescript
// Sections fade in and slide up as they enter viewport
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

// Parallax background layers
const ParallaxSection = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  
  return (
    <div className="relative">
      <motion.div style={{ y: y1 }} className="absolute inset-0">
        {/* Background orbs */}
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute inset-0">
        {/* Floating particles */}
      </motion.div>
    </div>
  );
};

// Stats counter: Numbers count up when scrolled into view
const AnimatedCounter = ({ target }: { target: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: 'easeOut' });
    }
  }, [isInView]);
  
  return <motion.span ref={ref}>{rounded}</motion.span>;
};
```

### 5.5 Lottie Animations (Pre-built)

| Animation | File | Usage |
|-----------|------|-------|
| Fire Loading | `fire-loading.json` | Processing state main animation |
| Document Scan | `document-scan.json` | Resume parsing feedback |
| Confetti Burst | `confetti.json` | Score > 80 celebration |
| Checkmark | `checkmark.json` | Upload success |
| Flame Loop | `flame-loop.json` | Roast mode selector icon |
| Heart Pulse | `heart-pulse.json` | Nice mode selector icon |
| Error Shake | `error-shake.json` | Upload/processing failure |

---

## 6. Page Layouts

### 6.1 Landing Page Structure

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, glass effect, blur on scroll)          │
│  Logo  │  Features  │  Pricing  │  [Sign In] [🔥 Try]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO SECTION (100vh)                                   │
│  ┌─────────────────────────────────────────────┐        │
│  │  "Your Resume Sucks.                        │        │
│  │   Let's Fix That." 🔥                       │        │
│  │                                              │        │
│  │  Brutally honest AI resume reviews that      │        │
│  │  are actually fun to read.                   │        │
│  │                                              │        │
│  │  [🔥 Roast My Resume]  [😊 Be Nice]         │        │
│  │                                              │        │
│  │  ⭐ 50,000+ resumes roasted                  │        │
│  │                                              │        │
│  │            ┌───────────────┐                  │        │
│  │            │  3D Resume    │  ← Floating,    │        │
│  │            │  Model with   │    rotating,     │        │
│  │            │  fire particles│   parallax      │        │
│  │            └───────────────┘                  │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  SOCIAL PROOF BAR (scrolling logos / testimonials)       │
│                                                         │
│  HOW IT WORKS (3-step animated cards)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ 📤      │  │ 🤖      │  │ 🔥      │                 │
│  │ Upload  │→ │ AI      │→ │ Get     │                 │
│  │ Resume  │  │ Analyzes│  │ Roasted │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│                                                         │
│  LIVE DEMO (interactive sample roast result)            ��
│  Animated score ring + section cards                    │
│                                                         │
│  FEATURES GRID (2x3 bento-style cards)                  │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 🔥 Roast Mode    │  │ 😊 Nice Mode     │             │
│  ├──────────────────┤  ├──────────────────┤             │
│  │ 📊 Score System  │  │ 🎯 Industry Match │             │
│  ├──────────────────┤  ├──────────────────┤             │
│  │ 📱 Share Results │  │ 📈 Track Progress │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                         │
│  TESTIMONIALS (carousel with 3D card flip)              │
│                                                         │
│  PRICING SECTION (3 cards with glow effects)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Free    │  │  Pro 🔥  │  │  Team    │              │
│  │  $0/mo   │  │ $9.99/mo │  │ $29.99/mo│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  FAQ (animated accordion)                               │
│                                                         │
│  FINAL CTA                                              │
│  "Stop Getting Ghosted. Start Getting Hired."           │
│  [🔥 Roast My Resume — It's Free]                       │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Results Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (with user avatar + back to dashboard)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SCORE HERO (centered, dramatic reveal)                 │
│  ┌───────────────────────────���─────────────────┐        │
│  │              ┌─────────┐                     │        │
│  │              │  42/100  │  ← Animated ring   │        │
│  │              │  🔥      │    with count-up    │        │
│  │              └─────────┘                     │        │
│  │                                              │        │
│  │  "Did a ChatGPT Write This?                  │        │
│  │   Because It's Generic AF."                  │        │
│  │                                              │        │
│  │  [📤 Share]  [📥 Download]  [🔄 Re-Roast]    │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  EXECUTIVE SUMMARY (glass card, full width)             │
│  "I've reviewed resumes from fresh bootcamp grads..."   │
│                                                         │
│  TOP STRENGTHS + CRITICAL FIXES (2 columns)             │
│  ┌──────────────────┐  ┌──────────────────────┐         │
│  │ ✅ Strengths     │  │ 🚨 Critical Fixes    │         │
│  │ • Career growth  │  │ • Quantify bullets   │         │
│  │ • Tech skills    │  │ • Cut to one page    │         │
│  └──────────────────┘  │ • Fix summary        │         │
│                        └──────────────────────┘         │
│                                                         │
│  SECTION BREAKDOWN (staggered card list)                │
│  ┌──────────────────────────────────────────────┐       │
│  │ Professional Summary              25/100 🔴  │       │
│  │ "Your summary is so vague it could..."       │       │
│  │ ▸ Suggestions (3)                            │       │
│  ├──────────────────────────────────────────────┤       │
│  │ Work Experience                   45/100 🟠  │       │
│  │ "You 'managed projects' and..."              │       │
│  │ ▸ Suggestions (3)                            │       │
│  ├──────────────────────────────────────────────┤       │
│  │ Skills                            55/100 🟡  │       │
│  │ "Your skills section looks like..."          │       │
│  │ ▸ Suggestions (3)                            │       │
│  └──────────────────────────────────────────────┘       │
│                                                         │
│  UPGRADE CTA (for free users)                           │
│  "Want the FULL Gordon Ramsay experience?"               │
│  [Upgrade to Pro — $9.99/mo]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Responsive Design Breakpoints

```css
/* Mobile First */
--screen-sm:  640px;    /* Small phones → large phones */
--screen-md:  768px;    /* Tablets */
--screen-lg:  1024px;   /* Small laptops */
--screen-xl:  1280px;   /* Desktops */
--screen-2xl: 1536px;   /* Large screens */

/* Key responsive behaviors */
/* Mobile: Single column, full-width cards, simplified animations */
/* Tablet: Two-column layout for strengths/fixes, sidebar collapses */
/* Desktop: Full layout, all animations, 3D hero scene */
/* Large: Max-width container (1280px), more whitespace */
```

### Mobile-Specific Adaptations
- 3D hero scene → replaced with animated gradient + Lottie flame
- Magnetic buttons → standard tap animations
- Parallax scrolling → disabled (performance)
- Glassmorphism blur → reduced (10px vs 20px)
- Score reveal → simplified (no spotlight dimming)
- Card tilt effects → disabled