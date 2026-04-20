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

    return () => unsub();
  }, []);

  return null;
}
