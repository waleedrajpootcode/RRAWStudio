import { useEffect, useState } from "react";
import StudioLayout from "../layouts/StudioLayout";
import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectWorkspacePage from "../pages/ProjectWorkspacePage";
import UniversePage from "../pages/UniversePage";
import { ProjectProvider } from "./ProjectContext";

const routeMap: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
};

function projectIdFromPath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  return match?.[1] ?? null;
}

function projectIdFromUniversePath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)\/universe$/);
  return match?.[1] ?? null;
}

const pathForItem: Record<string, string> = {
  Dashboard: "/",
  Projects: "/projects",
  Universe: "/universe",
};

function itemFromPath(pathname: string) {
  if (projectIdFromUniversePath(pathname)) {
    return "Universe";
  }

  if (projectIdFromPath(pathname)) {
    return "Projects";
  }

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

    const currentProjectId =
      projectIdFromPath(window.location.pathname) ??
      projectIdFromUniversePath(window.location.pathname);

    const resolvedPath =
      item === "Universe" && currentProjectId
        ? `/projects/${currentProjectId}/universe`
        : nextPath;

    if (resolvedPath && window.location.pathname !== resolvedPath) {
      window.history.pushState({}, "", resolvedPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    setActiveItem(item);
  }

  const projectId =
    projectIdFromPath(window.location.pathname) ??
    projectIdFromUniversePath(window.location.pathname);

  const isUniverseRoute = Boolean(
    projectIdFromUniversePath(window.location.pathname),
  );

  return (
    <StudioLayout activeItem={activeItem} onSelect={handleSelect}>
      {projectId ? (
        <ProjectProvider projectId={projectId}>
          {isUniverseRoute ? <UniversePage /> : <ProjectWorkspacePage />}
        </ProjectProvider>
      ) : activeItem === "Projects" ? (
        <ProjectsPage />
      ) : (
        <DashboardPage />
      )}
    </StudioLayout>
  );
}
