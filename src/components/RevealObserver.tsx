"use client";
import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const revealEls = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || "0", 10);
            setTimeout(() => el.classList.add("visible"), delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
