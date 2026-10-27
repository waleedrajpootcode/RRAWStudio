import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type StudioLayoutProps = {
  children: ReactNode;
};

export default function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <div className="studio-shell">
      <Sidebar />
      <div className="studio-main">
        <TopBar />
        <main className="studio-content">{children}</main>
      </div>
    </div>
  );
}
