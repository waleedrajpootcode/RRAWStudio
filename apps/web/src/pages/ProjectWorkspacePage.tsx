import { useProject } from "../app/ProjectContext";

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
        </div>
        <span>
          {project.status === "active" ? "Active production" : "Archived"}
        </span>
      </div>

      <div className="project-workspace-grid">
        <div className="project-create-panel">
          <p className="eyebrow">PROJECT CONTEXT</p>
          <h3>Ready for production</h3>
          <p>
            {project.description ||
              "This production workspace is ready for your story pipeline."}
          </p>
        </div>

        <div className="project-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PRODUCTION PIPELINE</p>
              <h3>Workspace modules</h3>
            </div>
            <span>Project ID: {project.id.slice(0, 8)}</span>
          </div>

          <div className="project-list">
            {["Universe", "Characters", "Story", "Scenes", "Shots", "Assets"].map(
              (module) => (
                <article className="project-card" key={module}>
                  <div className="project-card-mark">R</div>
                  <div className="project-card-copy">
                    <strong>{module}</strong>
                    <p>Production module will be connected to this project.</p>
                  </div>
                  <small>Foundation</small>
                </article>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
