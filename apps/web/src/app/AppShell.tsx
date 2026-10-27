import { useEffect, useState } from "react";
import StudioLayout from "../layouts/StudioLayout";
import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectWorkspacePage from "../pages/ProjectWorkspacePage";
import UniversePage from "../pages/UniversePage";
import CharactersPage from "../pages/CharactersPage";
import StoryPage from "../pages/StoryPage";
import EpisodesPage from "../pages/EpisodesPage";
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

function projectIdFromCharactersPath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)\/characters$/);
  return match?.[1] ?? null;
}

function projectIdFromStoryPath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)\/story$/);
  return match?.[1] ?? null;
}

function projectIdFromEpisodesPath(pathname: string) {
  const match = pathname.match(/^\/projects\/([^/]+)\/episodes$/);
  return match?.[1] ?? null;
}

const pathForItem: Record<string, string> = {
  Dashboard: "/",
  Projects: "/projects",
  Universe: "/universe",
  Characters: "/characters",
  Story: "/story",
  Episodes: "/episodes",
};

function itemFromPath(pathname: string) {
  if (projectIdFromUniversePath(pathname)) {
    return "Universe";
  }

  if (projectIdFromCharactersPath(pathname)) {
    return "Characters";
  }

  if (projectIdFromStoryPath(pathname)) {
    return "Story";
  }

  if (projectIdFromEpisodesPath(pathname)) {
    return "Episodes";
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
      projectIdFromUniversePath(window.location.pathname) ??
      projectIdFromCharactersPath(window.location.pathname) ??
      projectIdFromStoryPath(window.location.pathname) ??
      projectIdFromEpisodesPath(window.location.pathname);

    const resolvedPath =
      item === "Universe" && currentProjectId
        ? `/projects/${currentProjectId}/universe`
        : item === "Characters" && currentProjectId
          ? `/projects/${currentProjectId}/characters`
          : item === "Story" && currentProjectId
            ? `/projects/${currentProjectId}/story`
            : item === "Episodes" && currentProjectId
              ? `/projects/${currentProjectId}/episodes`
              : nextPath;

    if (resolvedPath && window.location.pathname !== resolvedPath) {
      window.history.pushState({}, "", resolvedPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    setActiveItem(item);
  }

  const projectId =
    projectIdFromPath(window.location.pathname) ??
    projectIdFromUniversePath(window.location.pathname) ??
    projectIdFromCharactersPath(window.location.pathname) ??
    projectIdFromStoryPath(window.location.pathname) ??
    projectIdFromEpisodesPath(window.location.pathname);

  const isUniverseRoute = Boolean(
    projectIdFromUniversePath(window.location.pathname),
  );

  const isCharactersRoute = Boolean(
    projectIdFromCharactersPath(window.location.pathname),
  );

  const isStoryRoute = Boolean(
    projectIdFromStoryPath(window.location.pathname),
  );

  const isEpisodesRoute = Boolean(
    projectIdFromEpisodesPath(window.location.pathname),
  );

  return (
    <StudioLayout activeItem={activeItem} onSelect={handleSelect}>
      {projectId ? (
        <ProjectProvider projectId={projectId}>
          {isUniverseRoute ? (
            <UniversePage />
          ) : isCharactersRoute ? (
            <CharactersPage />
          ) : isStoryRoute ? (
            <StoryPage />
          ) : isEpisodesRoute ? (
            <EpisodesPage />
          ) : (
            <ProjectWorkspacePage />
          )}
        </ProjectProvider>
      ) : activeItem === "Projects" ? (
        <ProjectsPage />
      ) : (
        <DashboardPage />
      )}
    </StudioLayout>
  );
}
