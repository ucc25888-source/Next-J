"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ClientOnly = dynamic(() => import("./ClientOnly"), { ssr: false });

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <ClientOnly>{children}</ClientOnly>;
}
