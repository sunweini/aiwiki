"use client";

import { useEffect } from "react";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AnchorScroll() {
  useEffect(() => {
    function scrollFromHash() {
      const h = location.hash;
      if (h.length > 1) scrollToId(h.slice(1));
    }

    scrollFromHash();
    window.addEventListener("hashchange", scrollFromHash);

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = a.getAttribute("href")?.slice(1);
        if (target) {
          history.pushState(null, "", a.getAttribute("href") ?? "");
          scrollToId(target);
        }
      });
    });

    return () => window.removeEventListener("hashchange", scrollFromHash);
  }, []);

  return null;
}
