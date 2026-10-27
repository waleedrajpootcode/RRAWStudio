import { useProject } from "../app/ProjectContext";

type WorkspaceModule = {
  name: string;
  eyebrow: string;
  description: string;
  status: "available" | "next";
  path?: "universe" | "characters";
};

const workspaceModules: WorkspaceModule[] = [
  {
    name: "Universe",
    eyebrow: "WORLD FOUNDATION",
    description:
      "Define the world, visual identity, rules, lore, timeline and atmosphere.",
    status: "available",
    path: "universe",
  },
  {
    name: "Characters",
    eyebrow: "CHARACTER DNA",
    description:
      "Build consistent character identities, visual DNA, relationships and arcs.",
    status: "available",
    path: "characters",
  },
  {
    name: "Story",
    eyebrow: "STORY ENGINE",
    description:
      "Develop the concept, story structure, episodes and narrative direction.",
    status: "next",
  },
  {
    name: "Scenes",
    eyebrow: "SCENE DIRECTOR",
    description:
      "Turn story beats into production-ready scenes and continuity.",
    status: "next",
  },
  {
    name: "Shots",
    eyebrow: "SHOT EDITOR",
    description:
      "Plan renderable shots with camera, composition, motion, audio and layers.",
    status: "next",
  },
  {
    name: "Assets",
    eyebrow: "AI ASSETS",
    description:
      "Organize images, references, generated assets and production media.",
    status: "next",
  },
];

function openModule(projectId: string, module: WorkspaceModule) {
  if (!module.path) {
    return;
  }

  const nextPath = `/projects/${projectId}/${module.path}`;

  if (window.location.pathname !== nextPath) {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

export default function ProjectWorkspacePage() {
  const { project, loading, error } = useProject();

  if (loading) {
    return (
      <section className="projects-page">
        <div className="empty-state">Loading production workspace...</div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="projects-page">
        <div className="project-error">
          {error || "Project not found."}
        </div>
      </section>
    );
  }

  return (
    <section className="projects-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PRODUCTION WORKSPACE</p>
          <h2>{project.name}</h2>
          <p>
            {project.description ||
              "Your production pipeline starts here. Build the world, cast and story before moving into scenes and shots."}
          </p>
        </div>

        <span>
          {project.status === "active" ? "Active production" : "Archived"}
        </span>
      </div>

      <div className="project-workspace-grid">
        <div className="project-create-panel">
          <p className="eyebrow">PROJECT CONTROL</p>
          <h3>Build the production in order</h3>
          <p>
            RRAW keeps every creative decision inside the project so Universe,
            Character DNA, Story, Scenes and Shots can share the same
            production context.
          </p>

          <div className="project-workspace-meta">
            <span>PROJECT</span>
            <strong>{project.id.slice(0, 8)}</strong>
          </div>
        </div>

        <div className="project-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PRODUCTION PIPELINE</p>
              <h3>Studio modules</h3>
            </div>
            <span>2 available</span>
          </div>

          <div className="project-list">
            {workspaceModules.map((module, index) => (
              <button
                className={`project-card project-module-card ${
                  module.status === "available"
                    ? "project-module-card-active"
                    : "project-module-card-next"
                }`}
                key={module.name}
                type="button"
                onClick={() => openModule(project.id, module)}
                disabled={module.status !== "available"}
              >
                <div className="project-card-mark">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="project-card-copy">
                  <small>{module.eyebrow}</small>
                  <strong>{module.name}</strong>
                  <p>{module.description}</p>
                </div>

                <span className="project-module-status">
                  {module.status === "available" ? "Open" : "Next"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
