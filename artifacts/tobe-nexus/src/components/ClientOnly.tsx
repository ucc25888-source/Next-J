"use client";

import { useState, useEffect, type ReactNode } from "react";

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-titanium-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-aurora-500/30 border-t-aurora-500 rounded-full animate-spin" />
          <p className="text-xs text-glacier-600 tracking-wider">載入中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
