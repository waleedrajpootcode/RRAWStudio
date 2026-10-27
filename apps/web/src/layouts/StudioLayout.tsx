import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type StudioLayoutProps = {
  children: ReactNode;
  activeItem: string;
  onSelect: (item: string) => void;
};

export default function StudioLayout({
  children,
  activeItem,
  onSelect,
}: StudioLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="studio-shell">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      {sidebarOpen && (
        <button
          className="mobile-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeItem={activeItem}
        onSelect={onSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="studio-main">
        <TopBar />
        <main className="studio-content">{children}</main>
      </div>
    </div>
  );
}
