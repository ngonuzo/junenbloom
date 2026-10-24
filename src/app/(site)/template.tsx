import React from "react";

/** Soft fade between pages (T1.12). CSS-only so it never delays first paint. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
