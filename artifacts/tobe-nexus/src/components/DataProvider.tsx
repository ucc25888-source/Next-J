"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";

const REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setProperties } = usePropertyStore();
  const { setCurrentClient } = useSystemStore();
  const initialized = useRef(false);
  const lastFetchedAt = useRef<number>(0);

  async function fetchProperties() {
    try {
      const res = await fetch("/api/properties", { cache: "no-store" });
      if (res.ok) {
        const { properties } = await res.json();
        setProperties(properties ?? []);
        lastFetchedAt.current = Date.now();
      }
    } catch {
      // Network error — keep existing state
    }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const [meRes, propsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/properties", { cache: "no-store" }),
        ]);

        if (meRes.status === 401) {
          router.push("/login");
          return;
        }

        if (meRes.ok) {
          const { client } = await meRes.json();
          setCurrentClient(client);
        }

        if (propsRes.ok) {
          const { properties } = await propsRes.json();
          setProperties(properties ?? []);
          lastFetchedAt.current = Date.now();
        }
      } catch {
        // Network error — keep existing state
      }
    }

    init();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastFetchedAt.current;
        if (elapsed > REFRESH_INTERVAL_MS) {
          fetchProperties();
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [router, setProperties, setCurrentClient]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
