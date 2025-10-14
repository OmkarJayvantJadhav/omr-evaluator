import React, { useEffect, useState, Suspense, useRef } from "react";
import { Helmet } from "react-helmet-async";
import anime from "animejs/lib/anime.es.js";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const FluidGlass = React.lazy(() => import("./FluidGlass"));
const LiquidEther = React.lazy(() => import("./LiquidEther"));

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const sectionsRef = useRef([]);

  // Handle dark/light mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Background animation
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      anime({
        targets: ".background-shape",
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: () => anime.random(0.8, 1.2),
        easing: "easeInOutSine",
        duration: 8000,
        direction: "alternate",
        loop: true,
      });
    }
    setTimeout(() => setAnimationDone(true), 1000);
  }, []);

  // Section reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("animate-fadeInUp");
        });
      },
      { threshold: 0.15 }
    );

    sectionsRef.current.forEach(sec => sec && observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  // Carousel
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % totalSlides), 4500);
    return () => clearInterval(timer);
  }, []);

  const scrollToSteps = () => {
    document.getElementById("steps")?.scrollIntoView({ behavior: "smooth" });
  };

  // Smooth scroll for navbar
  const smoothScroll = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? "dark bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
      <Helmet>
        <title>SCANALYZE – AI-Powered OMR Evaluation</title>
        <meta
          name="description"
          content="SCANALYZE automates OMR grading with AI precision. Upload, analyze, and export results instantly."
        />
      </Helmet>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-opacity-70 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wide">SCANALYZE</h1>
          <div className="flex items-center gap-6">
            <a href="#features" onClick={e => smoothScroll(e, "#features")} className="hover:text-blue-500 transition">Features</a>
            <a href="#steps" onClick={e => smoothScroll(e, "#steps")} className="hover:text-blue-500 transition">How It Works</a>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 transition" aria-label="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Login</button>
            <button className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">Signup</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-slate-100 dark:from-slate-800 dark:to-slate-900" />}>
            {animationDone && (
              <>
                <LiquidEther />
                <FluidGlass />
              </>
            )}
          </Suspense>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
        >
          Revolutionize OMR Evaluation with{" "}
          <span className="text-blue-600 dark:text-blue-400">AI Precision</span>
        </motion.h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Scan, analyze, and evaluate OMR sheets seamlessly — powered by SCANALYZE.
        </p>
        <div className="mt-8 flex gap-4">
          <button onClick={scrollToSteps} className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={el => (sectionsRef.current[0] = el)} className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">Why Choose SCANALYZE?</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 px-6">
            {[
              { title: "AI Accuracy", desc: "Powered by advanced algorithms ensuring 99.9% detection accuracy." },
              { title: "Real-Time Results", desc: "Process OMR sheets and view results instantly on screen." },
              { title: "Noise Resistant", desc: "Handles skewed, tilted, or low-quality scans effortlessly." },
              { title: "Data Export", desc: "Export evaluated results in Excel, CSV, or PDF format." },
              { title: "Customizable Sheets", desc: "Supports various OMR templates and bubble configurations." },
              { title: "Cloud Integration", desc: "Store and manage results securely with cloud support." },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="steps" ref={el => (sectionsRef.current[1] = el)} className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">How It Works</h2>
          <div className="grid gap-10 sm:grid-cols-3 px-6">
            {[
              { title: "1️⃣ Upload Sheet", desc: "Upload scanned OMR sheets in PDF or image format." },
              { title: "2️⃣ Analyze Automatically", desc: "AI detects bubbles, evaluates responses, and calculates results." },
              { title: "3️⃣ Export Results", desc: "Download accurate results instantly in multiple formats." },
            ].map((step, i) => (
              <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-20 bg-gradient-to-t from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 text-center">
        <h2 className="text-4xl font-bold mb-10">See It in Action</h2>
        <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-lg">
          <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {[
              "/images/omr-demo1.jpg",
              "/images/omr-demo2.jpg",
              "/images/omr-demo3.jpg",
            ].map((src, i) => (
              <img key={i} src={src} alt={`Demo ${i + 1}`} className="w-full h-96 object-cover" loading="lazy" />
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
