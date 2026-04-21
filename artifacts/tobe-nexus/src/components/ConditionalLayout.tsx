"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import DataProvider from "./DataProvider";
import StoreHydrator from "./StoreHydrator";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname === "/login" || pathname.startsWith("/admin");

  if (isFullPage) {
    return <>{children}</>;
  }

  return (
    <DataProvider>
      <StoreHydrator />
      <Sidebar />
      {/* pt-14 on mobile for top bar, pb-20 on mobile for bottom nav, no extra padding on lg */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-titanium-800 pt-14 pb-20 lg:pt-0 lg:pb-0">
        {children}
      </div>
    </DataProvider>
  );
}
