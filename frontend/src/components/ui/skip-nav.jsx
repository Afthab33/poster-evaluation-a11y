import React from "react";

export function SkipNavLink({ children = "Skip to content" }) {
  return (
    <a
      href="#skip-nav-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:border-2 focus:border-primary focus:text-primary focus:top-2 focus:left-2 focus:rounded-md"
    >
      {children}
    </a>
  );
}

export function SkipNavContent() {
  return <div id="skip-nav-content" tabIndex={-1} />;
}