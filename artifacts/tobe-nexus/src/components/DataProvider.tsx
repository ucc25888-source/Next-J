"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";

const MIN_REFETCH_MS = 5 * 1000; // refetch at most every 5s to avoid spam

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setProperties } = usePropertyStore();
  const { setCurrentClient } = useSystemStore();
  const initialized = useRef(false);
  const lastFetchedAt = useRef<number>(0);
  const fetching = useRef(false);

  async function fetchProperties() {
    if (fetching.current) return;
    const elapsed = Date.now() - lastFetchedAt.current;
    if (elapsed < MIN_REFETCH_MS) return;
    fetching.current = true;
    try {
      const ts = Date.now();
      const res = await fetch(`/api/properties?_t=${ts}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store", "Pragma": "no-cache" },
      });
      if (res.ok) {
        const { properties } = await res.json();
        setProperties(properties ?? []);
        lastFetchedAt.current = Date.now();
      }
    } catch {
      // Network error — keep existing state
    } finally {
      fetching.current = false;
    }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const ts = Date.now();
        const [meRes, propsRes] = await Promise.all([
          fetch(`/api/auth/me?_t=${ts}`, { cache: "no-store" }),
          fetch(`/api/properties?_t=${ts}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache, no-store", "Pragma": "no-cache" },
          }),
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

    // visibilitychange: fires when tab becomes visible (most browsers)
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchProperties();
      }
    }

    // focus: fires on iOS Safari when user switches back to the browser tab
    function handleFocus() {
      fetchProperties();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router, setProperties, setCurrentClient]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
