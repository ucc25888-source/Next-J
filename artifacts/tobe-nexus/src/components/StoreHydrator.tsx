"use client";

import { useEffect } from "react";
import { useSystemStore } from "@/store/useSystemStore";

const COUNTER_KEY = "tobe-nexus-counters-v1";

export default function StoreHydrator() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUNTER_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) {
          useSystemStore.setState({ counters: saved });
        }
      }
    } catch {}

    const unsub = useSystemStore.subscribe((state) => {
      try {
        localStorage.setItem(COUNTER_KEY, JSON.stringify(state.counters));
      } catch {}
    });

    const removeTranslateArtifacts = () => {
      document
        .querySelectorAll(
          '[class*="VIpgJd"], .skiptranslate, #goog-gt-tt, ' +
          '.goog-te-banner-frame, .goog-te-spinner-pos, ' +
          '.goog-te-menu-frame, #goog-gt-vt'
        )
        .forEach((el) => (el as HTMLElement).remove());
    };

    removeTranslateArtifacts();

    const observer = new MutationObserver(() => {
      removeTranslateArtifacts();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => {
      unsub();
      observer.disconnect();
    };
  }, []);

  return null;
}
