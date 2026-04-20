"use client";

import { useEffect } from "react";
import { usePropertyStore, DEMO_PROPERTY } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";

const PROP_KEY = "tobe-nexus-properties-v1";
const SYS_KEY = "tobe-nexus-system-v1";

export default function StoreHydrator() {
  useEffect(() => {
    // Load properties from localStorage
    try {
      const raw = localStorage.getItem(PROP_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.properties) && saved.properties.length > 0) {
          usePropertyStore.setState({ properties: saved.properties });
        }
      }
    } catch {}

    // Load system state (copies + counters) from localStorage
    try {
      const raw = localStorage.getItem(SYS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.copies) useSystemStore.setState({ copies: saved.copies });
        if (saved.counters) useSystemStore.setState({ counters: saved.counters });
      }
    } catch {}

    // Subscribe to persist changes
    const unsubProp = usePropertyStore.subscribe((state) => {
      try {
        localStorage.setItem(PROP_KEY, JSON.stringify({ properties: state.properties }));
      } catch {}
    });

    const unsubSys = useSystemStore.subscribe((state) => {
      try {
        localStorage.setItem(SYS_KEY, JSON.stringify({
          copies: state.copies,
          counters: state.counters,
        }));
      } catch {}
    });

    return () => {
      unsubProp();
      unsubSys();
    };
  }, []);

  return null;
}
