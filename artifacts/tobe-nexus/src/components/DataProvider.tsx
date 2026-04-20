"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setProperties } = usePropertyStore();
  const { setCurrentClient } = useSystemStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const [meRes, propsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/properties"),
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
        }
      } catch {
        // Network error — keep existing state
      }
    }

    init();
  }, [router, setProperties, setCurrentClient]);

  return <>{children}</>;
}
