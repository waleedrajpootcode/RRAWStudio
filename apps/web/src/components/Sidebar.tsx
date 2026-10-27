import type { ReactNode } from "react";

type NavItem = {
  label: string;
  icon: ReactNode;
};

function NavIcon({ label }: { label: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (label) {
    case "Dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "Projects":
      return (
        <svg {...common}>
          <path d="M4 7.5h6l2 2h8v8.5A2 2 0 0 1 18 20H6a2 2 0 0 1-2-2.5z" />
          <path d="M4 7.5V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1.5" />
        </svg>
      );
    case "Universe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-7-7" />
          <path d="M5 12a7 7 0 0 0 7 7" />
          <path d="M12 5a7 7 0 0 0-7 7" />
          <path d="M12 19a7 7 0 0 0 7-7" />
        </svg>
      );
    case "Characters":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.7-3.2 3.2-5 7-5s6.3 1.8 7 5" />
        </svg>
      );
    case "Story":
      return (
        <svg {...common}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "Scenes":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 15 5-5 4 4 3-3 6 6" />
        </svg>
      );
    case "Shots":
      return (
        <svg {...common}>
          <path d="M4 7h16v10H4z" />
          <path d="m9 7 2-3h2l2 3M10 17l-2 3M14 17l2 3" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "Assets":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="m4 15 5-5 4 4 3-3 4 4" />
        </svg>
      );
    case "Audio":
      return (
        <svg {...common}>
          <path d="M5 14a3 3 0 0 0 3 3h1V7H8a3 3 0 0 0-3 3z" />
          <path d="M9 7a6 6 0 0 1 0 10M13 5a9 9 0 0 1 0 14" />
        </svg>
      );
    case "Animation":
      return (
        <svg {...common}>
          <path d="m8 5 11 7-11 7z" />
          <path d="M4 5v14" />
        </svg>
      );
    case "Timeline":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4v16M16 4v16" />
        </svg>
      );
    case "Render":
      return (
        <svg {...common}>
          <path d="M7 4h10l3 4v12H4V8z" />
          <path d="M7 4v4h10V4M9 13h6M9 17h4" />
        </svg>
      );
    case "Exports":
      return (
        <svg {...common}>
          <path d="M12 3v11" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 15v4h14v-4" />
        </svg>
      );
    default:
      return null;
  }
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <NavIcon label="Dashboard" /> },
  { label: "Projects", icon: <NavIcon label="Projects" /> },
  { label: "Universe", icon: <NavIcon label="Universe" /> },
  { label: "Characters", icon: <NavIcon label="Characters" /> },
  { label: "Story", icon: <NavIcon label="Story" /> },
  { label: "Scenes", icon: <NavIcon label="Scenes" /> },
  { label: "Shots", icon: <NavIcon label="Shots" /> },
  { label: "Assets", icon: <NavIcon label="Assets" /> },
  { label: "Audio", icon: <NavIcon label="Audio" /> },
  { label: "Animation", icon: <NavIcon label="Animation" /> },
  { label: "Timeline", icon: <NavIcon label="Timeline" /> },
  { label: "Render", icon: <NavIcon label="Render" /> },
  { label: "Exports", icon: <NavIcon label="Exports" /> },
];

type SidebarProps = {
  activeItem: string;
  onSelect: (item: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  activeItem,
  onSelect,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <aside className={`studio-sidebar${isOpen ? " mobile-open" : ""}`}>
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
            className={`nav-item${activeItem === item.label ? " active" : ""}`}
            key={item.label}
            onClick={() => {
              onSelect(item.label);
              onClose();
            }}
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
