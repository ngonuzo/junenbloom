import React from "react";
import type { Metadata } from "next";
import { MotionProvider } from "@/components/ui/MotionProvider";

export const metadata: Metadata = {
  title: "Founders Studio",
  robots: { index: false, follow: false },
};

/** The founders' dashboard sits outside the public header and footer. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <div className="page-enter">{children}</div>
    </MotionProvider>
  );
}
