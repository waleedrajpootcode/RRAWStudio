import { useEffect, useState } from "react";
import StudioLayout from "../layouts/StudioLayout";
import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";

const routeMap: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
};

const pathForItem: Record<string, string> = {
  Dashboard: "/",
  Projects: "/projects",
};

function itemFromPath(pathname: string) {
  return routeMap[pathname] ?? "Dashboard";
}

export default function AppShell() {
  const [activeItem, setActiveItem] = useState(() =>
    itemFromPath(window.location.pathname),
  );

  useEffect(() => {
    function handlePopState() {
      setActiveItem(itemFromPath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleSelect(item: string) {
    const nextPath = pathForItem[item];

    if (!nextPath) {
      setActiveItem(item);
      return;
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }

    setActiveItem(item);
  }

  return (
    <StudioLayout activeItem={activeItem} onSelect={handleSelect}>
      {activeItem === "Projects" ? <ProjectsPage /> : <DashboardPage />}
    </StudioLayout>
  );
}
