"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
  delay?: number;
}

export function RevealOnScroll({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Papasok sa view → ipakita. Lumabas sa view → itago, para
        // "mag-replay" ulit ang animation pag-scroll pabalik.
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass = {
    up: "translate-y-6",
    left: "-translate-x-6",
    right: "translate-x-6",
    none: "",
  }[direction];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${directionClass}`
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}