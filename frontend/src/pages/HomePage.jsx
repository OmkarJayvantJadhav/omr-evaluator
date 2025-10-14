import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const ENABLE_LIQUID = (import.meta.env.VITE_ENABLE_LIQUID_ETHER === 'true');
  const particlesRef = useRef(null);
  const heroRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [FluidGlassComp, setFluidGlassComp] = useState(null);
  const [LiquidEtherComp, setLiquidEtherComp] = useState(null);

  const carouselImages = [
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551281044-8b29a0dd7d51?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516383607781-913a19294fd1?q=80&w=1200&auto=format&fit=crop'
  ];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReduced = () => setIsReducedMotion(mq.matches);
    updateReduced();
    mq.addEventListener?.('change', updateReduced);
    return () => mq.removeEventListener?.('change', updateReduced);
  }, []);

  // Lazy-load FluidGlass/LiquidEther only when motion is allowed and feature enabled
  useEffect(() => {
    if (isReducedMotion || !ENABLE_LIQUID) return;
    let isMounted = true;
    import('../components/FluidGlass')
      .then((m) => {
        if (isMounted) setFluidGlassComp(() => m.default);
      })
      .catch(() => {
        // Silently skip if component not present; homepage continues to work
      });
    import('../components/LiquidEther')
      .then((m) => {
        if (isMounted) setLiquidEtherComp(() => m.default);
      })
      .catch(() => {
        // optional background; ignore if missing
      });
    return () => {
      isMounted = false;
    };
  }, [isReducedMotion, ENABLE_LIQUID]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') setDarkMode(true);
    } catch {}
  }, []);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let animation = null;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
      if (!isReducedMotion) {
        initParticles();
      } else {
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    function initParticles() {
      const count = Math.floor((canvas.clientWidth * canvas.clientHeight) / 22000);
      particles = Array.from({ length: Math.max(24, count) }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 * DPR + 0.6 * DPR,
        a: Math.random() * 0.6 + 0.2
      }));
      animateParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.a})`;
        ctx.fill();
      }
    }

    function animateParticles() {
      if (isReducedMotion) return;
      animation = anime({
        targets: particles,
        x: () => `+=${(Math.random() - 0.5) * 30}`,
        y: () => `+=${(Math.random() - 0.5) * 30}`,
        a: () => Math.random() * 0.5 + 0.2,
        duration: 4000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true,
        update: draw
      });
    }

    function onScrollParallax() {
      if (isReducedMotion) return;
      const scrolled = window.scrollY || window.pageYOffset;
      canvas.style.transform = `translate3d(0, ${scrolled * 0.04}px, 0)`;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScrollParallax, { passive: true });

    if (isReducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScrollParallax);
      if (animation && typeof animation.pause === 'function') {
        animation.pause();
      }
      if (animation && typeof animation.destroy === 'function') {
        animation.destroy();
      }
    };
  }, [isReducedMotion]);

  useEffect(() => {
    const sections = [heroRef, stepsRef, featuresRef, carouselRef].map(r => r.current).filter(Boolean);
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            observer.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Ensure hero becomes visible even if IntersectionObserver is throttled
  useEffect(() => {
    if (heroRef.current) heroRef.current.classList.add('in-view');
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;
    const interval = setInterval(() => {
      setCurrentSlide(s => (s + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isReducedMotion, carouselImages.length]);

  const scrollToSteps = () => {
    stepsRef.current?.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const NavLink = ({ href, children }) => (
    <Link to={href} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 rounded transition-colors dark:text-slate-300 dark:hover:text-white">
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100 selection:bg-blue-200/60 dark:selection:bg-blue-800/60">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Prefer LiquidEther as background if available; else fall back to particles canvas */}
        {LiquidEtherComp ? (
          <div className="absolute inset-0">
            <LiquidEtherComp
              colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
              mouseForce={16}
              cursorSize={90}
              isViscous={false}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.45}
              autoIntensity={2.0}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
              className="pointer-events-none"
            />
          </div>
        ) : (
          <canvas
            ref={particlesRef}
            aria-hidden="true"
            className="h-full w-full transition-transform duration-300 will-change-transform"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10" aria-hidden="true" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/20 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 shadow-premium dark:border-slate-800/60 dark:bg-slate-900/50">
        <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative">
             
              <Link to="/" className="flex items-center gap-3" aria-label="SCANALYZE home">
                <div className="mx-0 h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-glow">
                  <QrCodeIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="font-brand gradient-text text-xl tracking-tight">SCANALYZE</span>
              </Link>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#demo">Demo</NavLink>
            <button
              type="button"
              onClick={() => setDarkMode(d => !d)}
              aria-pressed={darkMode}
              aria-label="Toggle dark mode"
              className="rounded border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(o => !o)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="space-y-1 px-4 pb-3 pt-2">
              <a href="#features" className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Features</a>
              <a href="#how-it-works" className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">How it works</a>
              <a href="#demo" className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Demo</a>
              <div className="flex items-center gap-2 pt-2">
                <Link to="/login" className="flex-1 btn btn-secondary">Login</Link>
                <Link to="/register" className="flex-1 btn btn-primary">Sign Up</Link>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(d => !d)}
                aria-pressed={darkMode}
                className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {darkMode ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        )}
      </header>

      <section
        ref={heroRef}
        className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20 pb-16 sm:pb-24 lg:pb-28 sm:px-6 lg:px-8 transition-all duration-700"
      >
        <div>
          <div>
           
            <h1 className="heading-lg font-brand gradient-text mb-2">
              SCANALYZE
            </h1>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Scan. Analyze. Grade — Faster.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              SCANALYZE evaluates OMR sheets with AI-grade accuracy, delivers instant analytics, and exports results effortlessly.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Get Started
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M12.293 3.293a1 1 0 011.414 0L19 8.586l-5.293 5.293a1 1 0 01-1.414-1.414L15.586 10H3a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={scrollToSteps}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                How it works
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 18a1 1 0 01-1-1V5.414L5.707 8.707a1 1 0 01-1.414-1.414l4.999-5a1 1 0 011.416 0l5 5a1 1 0 11-1.414 1.414L11 5.414V17a1 1 0 01-1 1z" />
                </svg>
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No credit card required — free to try.
            </p>
          </div>
        </div>
      </section>

      {/* Replaced mockup with premium highlights */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-slate-100">
      Why Choose SCANALYZE
    </h2>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1 */}
      <div className="card p-6 rounded-2xl shadow-md hover:shadow-xl transition card-hover bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Precision OMR</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Accurate bubble detection with noise and skew handling.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Confidence scoring
        </div>
      </div>

      {/* Card 2 */}
      <div className="card p-6 rounded-2xl shadow-md hover:shadow-xl transition card-hover bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Instant Insights</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Question-wise analytics, pass rates, and exports.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> CSV/PDF reports
        </div>
      </div>

      {/* Card 3 */}
      <div className="card p-6 rounded-2xl shadow-md hover:shadow-xl transition card-hover bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Secure by Design</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Role-based access with hardened CORS and auditability.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Teacher/Student flows
        </div>
      </div>

      {/* Card 4 */}
      <div className="card p-6 rounded-2xl shadow-md hover:shadow-xl transition card-hover bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Cloud Ready</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Vercel + Railway deployment with MySQL/SQLite support.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Auto scale & logs
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Interactive 3D section (premium animated background element) */}
      {/*
        IMPORTANT: This section depends on a 3D component and model assets.
        - Component expected at: src/components/FluidGlass.jsx (default export)
        - Models expected under: public/assets/3d/
          e.g. public/assets/3d/lens.glb, bar.glb, cube.glb
        If the component is missing, this section will be skipped gracefully.
      */}
      {FluidGlassComp && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-premium backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/40">
            <h2 className="text-2xl font-bold">A premium, interactive visual</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Smooth, GPU-accelerated render with graceful fallbacks.</p>
            <div className="relative mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-white/40 shadow-inner dark:border-slate-800 dark:bg-slate-900/30">
              <div className="relative h-[420px] sm:h-[520px] lg:h-[600px]">
                <FluidGlassComp
                  // Modes: "lens", "bar", or "cube"
                  mode="lens"
                  // Customize props per mode below. Ensure corresponding .glb models exist under public/assets/3d
                  lensProps={{
                    scale: 0.25,
                    ior: 1.15,
                    thickness: 5,
                    chromaticAberration: 0.1,
                    anisotropy: 0.01,
                  }}
                  barProps={{}}
                  cubeProps={{}}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Liquid Ether foreground demo removed since it's now the background */}

      <section id="how-it-works" ref={stepsRef} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700 [&.in-view]:opacity-100 [&.in-view]:translate-y-0">
        <h2 className="text-3xl font-bold">How it works</h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Get from scan to insights in minutes — reliable, accurate, export-ready.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Upload', desc: 'Drag & drop OMR images or PDF.', icon: 'M4 12h16M12 4v16' },
            { title: 'Analyze', desc: 'AI-powered bubble detection.', icon: 'M12 3l7 7-7 7-7-7 7-7z' },
            { title: 'Review', desc: 'Instant scoring & breakdown.', icon: 'M5 13l4 4L19 7' },
            { title: 'Export', desc: 'PDF reports in one click.', icon: 'M4 4h16v12H4zM8 20h8' }
          ].map((s, i) => (
            <div
              key={s.title}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md focus-within:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              style={{ transitionDelay: `${i * 60}ms` }}
              tabIndex={0}
              aria-label={`${i + 1}. ${s.title}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 shadow-inner">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.desc}</p>
              <span className="mt-3 inline-flex items-center text-sm font-medium text-blue-700 opacity-0 transition group-hover:opacity-100 dark:text-blue-400">
                Learn more
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.293 15.707a1 1 0 01-1.414-1.414L12.172 11H5a1 1 0 110-2h7.172l-3.293-3.293a1 1 0 011.414-1.414L16.707 10l-6.414 5.707z" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" ref={featuresRef} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700 [&.in-view]:opacity-100 [&.in-view]:translate-y-0">
        <h2 className="text-3xl font-bold">Why SCANALYZE</h2>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Built for accuracy, speed, and peace of mind — at scale.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Accurate scanning', points: ['Robust bubble detection', 'Noise & skew handling', 'Confidence scoring'] },
            { title: 'Instant analytics', points: ['Question-wise insights', 'Pass rate metrics', 'Exportable charts'] },
            { title: 'Secure & reliable', points: ['Role-based access', 'Audit logs', 'CORS hardened'] },
            { title: 'Fast workflow', points: ['Drag & drop upload', 'One-click export', 'Keyboard shortcuts'] },
            { title: 'Scales with you', points: ['Cloud-ready', 'Optimized queries', 'MySQL/SQLite support'] }
          ].map((f, i) => (
            <article
              key={f.title}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {f.points.map(p => (
                    <li key={p} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 inline-flex items-center text-sm font-medium text-blue-700 opacity-0 transition group-hover:opacity-100 dark:text-blue-400">
                Explore
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.293 15.707a1 1 0 01-1.414-1.414L12.172 11H5a1 1 0 110-2h7.172l-3.293-3.293a1 1 0 011.414-1.414L16.707 10l-6.414 5.707z" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" ref={carouselRef} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700 [&.in-view]:opacity-100 [&.in-view]:translate-y-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">See it in action</h2>
            
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setCurrentSlide(s => (s - 1 + carouselImages.length) % carouselImages.length)}
              className="rounded border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setCurrentSlide(s => (s + 1) % carouselImages.length)}
              className="rounded border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ›
            </button>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="relative aspect-[16/9] w-full">
            {carouselImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Demo slide ${i + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
              />
            ))}
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${i === currentSlide ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>

      </section>

      <footer className="border-t border-slate-200/60 py-10 dark:border-slate-800/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-600" aria-hidden="true">
                <path fill="currentColor" d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              <span className="text-lg font-extrabold">SCANALYZE</span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              OMR evaluation made simple, accurate, and fast.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#features" className="hover:underline">Features</a></li>
              <li><a href="#how-it-works" className="hover:underline">How it works</a></li>
              <li><a href="/docs" className="hover:underline">Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/about" className="hover:underline">About</a></li>
              <li><a href="/privacy" className="hover:underline">Privacy</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Follow</h3>
            <div className="mt-3 flex gap-3">
              <a aria-label="Twitter" href="https://twitter.com" className="rounded p-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:hover:bg-slate-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 5.8c-.7.3-1.4.5-2.2.6a3.8 3.8 0 001.7-2.1 7.5 7.5 0 01-2.4.9 3.7 3.7 0 00-6.3 3.3A10.5 10.5 0 013 4.8a3.7 3.7 0 001.1 4.9 3.7 3.7 0 01-1.7-.5v.1a3.7 3.7 0 003 3.6 3.7 3.7 0 01-1.7.1 3.7 3.7 0 003.4 2.6A7.5 7.5 0 012 18.6a10.5 10.5 0 005.7 1.7c6.8 0 10.6-5.7 10.6-10.6v-.5c.7-.5 1.3-1.1 1.8-1.8z" /></svg>
              </a>
              <a aria-label="LinkedIn" href="https://linkedin.com" className="rounded p-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:hover:bg-slate-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4 3.5 3.2 4.3 3.2 5.3c0 1 .8 1.8 1.78 1.8h.02C6 7.1 6.8 6.3 6.8 5.3c0-1-.8-1.8-1.82-1.8zM3.5 8.7h3v11.8h-3V8.7zm6 0h2.9v1.6h.04c.4-.8 1.5-1.7 3.2-1.7 3.4 0 4 2.2 4 5v6.9h-3V14c0-1.1 0-2.6-1.6-2.6-1.6 0-1.8 1.3-1.8 2.6v6.5h-3V8.7z" /></svg>
              </a>
              <a aria-label="GitHub" href="https://github.com" className="rounded p-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:hover:bg-slate-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-2c-3 .6-3.7-1.3-3.7-1.3-.5-1.1-1.2-1.4-1.2-1.4-1-.7.1-.7.1-.7 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1 3 .7a2.3 2.3 0 01.7-1.5c-2.4-.3-5-1.2-5-5.2A4 4 0 017 8.9a3.7 3.7 0 01.1-2.9s.9-.3 3.1 1.2a10.6 10.6 0 015.6 0c2.3-1.5 3.1-1.2 3.1-1.2.2.8.1 1.7.1 2.9a4 4 0 011.1 2.8c0 4-2.6 4.9-5.1 5.2a2.6 2.6 0 01.8 2v3c0 .3.2.6.7.5A10 10 0 0012 2z" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-4 text-xs text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} SCANALYZE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

/*
Notes:
- Replace hero mockup and carouselImages URLs with your assets.
- Background uses anime.js particles and respects prefers-reduced-motion.
- Buttons link to /login and /register which exist in the app.
*/


