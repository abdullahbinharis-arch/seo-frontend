"use client";
import { useEffect, useRef } from "react";

export function LandingInteractive() {
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ═══ NAVBAR SCROLL ═══
    const nav = document.getElementById("navbar");
    const onScroll = () => {
      nav?.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ═══ COUNTER ANIMATION ═══
    const counterEls = document.querySelectorAll<HTMLElement>("[data-count]");
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && !el.dataset.animated) {
            el.dataset.animated = "true";
            const target = parseInt(el.dataset.count || "0", 10);
            const suffix = el.dataset.suffix || "";
            let current = 0;
            const step = Math.ceil(target / 60);
            const interval = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(interval);
              }
              el.textContent = current + suffix;
            }, 50);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterEls.forEach((el) => counterObserver.observe(el));

    // ═══ SCORE RING ANIMATION ═══
    const scoreRing = document.getElementById("scoreRing");
    let ringObserver: IntersectionObserver | undefined;
    if (scoreRing) {
      ringObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) scoreRing.classList.add("visible");
          });
        },
        { threshold: 0.5 }
      );
      ringObserver.observe(scoreRing);
    }

    // ═══ COMPETITOR BARS ANIMATION ═══
    const compBars = document.getElementById("compBars");
    let barsObserver: IntersectionObserver | undefined;
    if (compBars) {
      barsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const fills =
                compBars.querySelectorAll<HTMLElement>(".comp-bar-fill");
              fills.forEach((fill, i) => {
                setTimeout(() => {
                  fill.style.transform = "scaleX(1)";
                }, i * 300);
              });
            }
          });
        },
        { threshold: 0.5 }
      );
      barsObserver.observe(compBars);
    }

    // ═══ MOCK CHART BARS ═══
    const chart = document.getElementById("mockChart");
    if (chart && chart.children.length === 0) {
      const heights = [
        35, 50, 42, 65, 55, 72, 48, 80, 60, 88, 70, 95, 75, 68, 82, 90, 78,
        85, 92, 88,
      ];
      heights.forEach((h, i) => {
        const bar = document.createElement("div");
        bar.className = "mock-bar";
        bar.style.height = h + "%";
        bar.style.animationDelay = i * 0.12 + "s";
        chart.appendChild(bar);
      });
    }

    // ═══ FEATURE CARD SPOTLIGHT ═══
    const featureCards = document.querySelectorAll<HTMLElement>(".feature-card");
    const spotlightHandlers: Array<{
      card: HTMLElement;
      move: (e: MouseEvent) => void;
      leave: () => void;
    }> = [];
    featureCards.forEach((card) => {
      const spotlight = card.querySelector<HTMLElement>(".spotlight");
      if (!spotlight) return;
      const move = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        spotlight.style.left = e.clientX - rect.left - 150 + "px";
        spotlight.style.top = e.clientY - rect.top - 150 + "px";
        spotlight.style.opacity = "0.06";
      };
      const leave = () => {
        spotlight.style.opacity = "0";
      };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      spotlightHandlers.push({ card, move, leave });
    });

    // ═══ FLOATING PARTICLES ═══
    const container = particleRef.current;
    let particleInterval: ReturnType<typeof setInterval> | undefined;
    if (container) {
      const createParticle = () => {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = Math.random() * 100 + "%";
        p.style.animationDuration = 5 + Math.random() * 5 + "s";
        p.style.animationDelay = Math.random() * 4 + "s";
        container.appendChild(p);
        setTimeout(() => p.remove(), 12000);
      };
      particleInterval = setInterval(createParticle, 1000);
    }

    // ═══ HOW IT WORKS STEP ANIMATIONS ═══
    const steps = document.querySelectorAll<HTMLElement>(".step[data-step]");
    const lineFill = document.getElementById("stepsLineFill");
    const stepsAnimated = new Set<HTMLElement>();
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && !stepsAnimated.has(el)) {
            stepsAnimated.add(el);
            el.classList.add("active");
            const stepNum = parseInt(el.dataset.step || "0", 10);
            const pct = (stepNum / 3) * 100;
            if (lineFill) lineFill.style.height = pct + "%";
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -30px 0px" }
    );
    steps.forEach((s) => stepObserver.observe(s));

    // ═══ CLEANUP ═══
    return () => {
      window.removeEventListener("scroll", onScroll);
      counterObserver.disconnect();
      ringObserver?.disconnect();
      barsObserver?.disconnect();
      stepObserver.disconnect();
      spotlightHandlers.forEach(({ card, move, leave }) => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
      if (particleInterval) clearInterval(particleInterval);
    };
  }, []);

  return <div className="particles" ref={particleRef} id="particles" />;
}
