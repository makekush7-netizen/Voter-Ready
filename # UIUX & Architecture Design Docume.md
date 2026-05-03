# UI/UX & Architecture Design Document - Voter-Ready
**Version:** 3.0 (Hyper-Modern AI / "Otherworldly" Aesthetic)
**Target Framework:** Next.js 15.5.x (App Router), React 19, Tailwind CSS 4
**Status:** Deep Overhaul

## 1. Core Philosophy: "The Best of 2026 Consumer AI Apps"
The previous 'Fintech' aesthetic was too safe. To truly engage 18-25 year old Gen-Z Indian voters in 2026, the application must feel like a premium, next-generation AI tool (think Vercel, Linear, Anthropic). It needs to feel *cool*. 
- **The "Dark Mode" Default:** A deep, rich dark mode base with glowing accents. Light text on dark backgrounds feels instantly more modern and "premium tech".
- **Ethereal Motion:** Smooth, physics-based springs, fluid height changes, and staggered reveals.
- **Mesh Gradients & Glows:** Animated, subtle background gradients (Indigos, Emeralds, Ambers) that move like a slow aurora.
- **Glass & Light:** Cards aren't just solid; they have 1px semi-transparent borders (`border-white/10`), ultra-thin glowing dropshadows, and backdrop blurring. Textures like subtle film grain/noise add physical depth.

## 2. Global Design System
### Colors & Textures
* **Background (The Void):** Deep solid charcoal or near-black (`bg-[#050505]`), overlaid with an animated aurora/mesh gradient.
* **Surface/Card (Bento Box):** `bg-white/5` or `bg-zinc-900/50`. Must include `backdrop-blur-xl` and `border border-white/[0.08]`.
* **Primary Blur/Glow:** Deep Indigo (`#4f46e5`) mixed with Violet (`#7c3aed`), used in massive blurred background orbs (`blur-3xl`).
* **Typography:** Crisp white (`#ffffff`) for primary headers, soft silver (`text-zinc-400`) for body.
* **Accent (Action):** "Shimmer" buttons. Buttons with an animated shiny border and a rich gradient background.

### UI Component Specifications
* **Bento Grid Cards:** Everything sits inside finely crafted bento grids. Cards have an inner shadow (`shadow-inner`) to look like they are carved into the void.
* **Buttons (The Shimmer Effect):** Buttons must feel magical. Use an animated gradient border or a subtle moving shine over the button face. 
* **Sidebar (Desktop):** A floating, pill-shaped vertical dock, fully frosted glass `bg-white/5 backdrop-blur-2xl border-white/10`. NOT attached to the edge. It floats.
* **Bottom Nav (Mobile):** A floating pill at the bottom of the screen, just above the home indicator, highly blurred.

### Animations (`framer-motion`)
* **Layout Transitions:** `layoutId` for active states (e.g., the active tab background swooping to the new icon).
* **Hover:** Elements should slightly lift and increase border opacity on hover.
* **Background:** Slow, continuous CSS keyframe animations for the ambient glowing orbs.

## 3. Structural Architecture
* **Single Page App (`app/page.tsx`)**: The routing remains 100% `useState`. The state controls `AnimatePresence` to cross-fade between components seamlessly.
* **Layout Bounds:** Content is constrained to a sleek central column (max 800px wide) next to the floating dock, ensuring immense amounts of beautiful negative space.

## 4. Development Phases
Phase 1: The Ambient Shell (Mesh gradients, dark mode, floating glass dock, shimmer buttons).
Phase 2: EVM Simulator (Cyberpunk/Hardware realistic).
Phase 3: Eligibility Checker (AI conversation UI).
Phase 4: Visual Journey (Glowing timeline).
Phase 5: Booth Locator (Dark mode map with glowing radar pins).
