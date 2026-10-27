import type { ReactNode } from "react";

type NavItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "?", active: true },
  { label: "Projects", icon: "?" },
  { label: "Universe", icon: "?" },
  { label: "Characters", icon: "?" },
  { label: "Story", icon: "?" },
  { label: "Scenes", icon: "?" },
  { label: "Shots", icon: "?" },
  { label: "Assets", icon: "?" },
  { label: "Audio", icon: "?" },
  { label: "Animation", icon: "?" },
  { label: "Timeline", icon: "?" },
  { label: "Render", icon: "?" },
  { label: "Exports", icon: "?" },
];

export default function Sidebar() {
  return (
    <aside className="studio-sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div>
          <div className="brand-name">RRAW Studio</div>
          <div className="brand-subtitle">Animation Production OS</div>
        </div>
      </div>

      <nav className="studio-nav" aria-label="Studio navigation">
        <div className="nav-section-label">PRODUCTION</div>
        {navItems.map((item) => (
          <button
            className={`nav-item${item.active ? " active" : ""}`}
            key={item.label}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="engine-status">
          <span className="status-dot" />
          <span>Local Engine Ready</span>
        </div>
        <div className="version-label">RRAW Studio v0.1</div>
      </div>
    </aside>
  );
}
