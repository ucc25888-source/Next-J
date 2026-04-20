"use client";

import { useEffect } from "react";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";

export default function StoreHydrator() {
  useEffect(() => {
    usePropertyStore.persist.rehydrate();
    useSystemStore.persist.rehydrate();
  }, []);

  return null;
}
