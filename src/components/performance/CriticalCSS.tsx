/**
 * Critical CSS for above-the-fold hero section
 * Inlined in <head> to prevent render-blocking CSS from delaying LCP
 * These styles are duplicated from globals.css but load immediately
 */
export function CriticalCSS({ nonce }: { nonce?: string }) {
  return (
    <style
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
/* Critical Hero Section Styles - Inlined for LCP optimization */

/* Hero background gradient */
.bg-gradient-hero {
  background: linear-gradient(to bottom right, #0f172a, #1e3a8a, #1e293b);
  contain: layout style paint;
}

/* Layout utilities */
.section-padding {
  padding: 5rem 1rem;
}
@media (min-width: 640px) {
  .section-padding { padding-left: 1.5rem; padding-right: 1.5rem; }
}
@media (min-width: 1024px) {
  .section-padding { padding-left: 2rem; padding-right: 2rem; }
}

.container-max {
  margin-left: auto;
  margin-right: auto;
  max-width: 80rem;
}

/* Typography - Hero h1 */
h1 {
  font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
}

/* Text gradient for "Rise of Kingdoms" */
.text-gradient {
  background-image: linear-gradient(to right, #d97706, #f59e0b, #eab308);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Primary CTA button */
.btn-primary {
  position: relative;
  transform: translateZ(0);
  border-radius: 0.75rem;
  background-image: linear-gradient(to right, #f59e0b, #d97706);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

/* Secondary CTA button */
.btn-secondary {
  position: relative;
  transform: translateZ(0);
  border-radius: 0.75rem;
  border: 2px solid #e2e8f0;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  color: #334155;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  transition: all 0.3s;
}

/* Glassmorphism for stat cards */
.glassmorphism {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
}

/* FadeInUp animation for hero content */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
}

/* Glow animation for "Rise of Kingdoms" */
@keyframes glow {
  from {
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.6);
  }
}
.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

/* Gradient overlay */
.bg-linear-to-t {
  background-image: linear-gradient(to top, var(--tw-gradient-stops));
}

/* Hide content until CSS loads to prevent FOUC */
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { inset: 0; }
.overflow-hidden { overflow: hidden; }
.z-10 { z-index: 10; }
.text-center { text-align: center; }
.text-white { color: white; }
.text-5xl { font-size: 3rem; line-height: 1; }
.font-bold { font-weight: 700; }
.tracking-tight { letter-spacing: -0.025em; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
.block { display: block; }

@media (min-width: 768px) {
  .md\\:text-7xl { font-size: 4.5rem; line-height: 1; }
}
`
      }}
    />
  )
}
