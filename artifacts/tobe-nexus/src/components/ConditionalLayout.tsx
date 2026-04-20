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
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-titanium-800">
        {children}
      </div>
    </DataProvider>
  );
}
