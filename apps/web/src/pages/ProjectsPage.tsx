import { FormEvent, useEffect, useState } from "react";
import { createProject, listProjects, type Project } from "../api/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      setProjects(await listProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const project = await createProject(name, description);
      setProjects((current) => [project, ...current]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="projects-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PRODUCTION WORKSPACES</p>
          <h2>Projects</h2>
        </div>
        <span>{projects.length} project{projects.length === 1 ? "" : "s"}</span>
      </div>

      <div className="project-workspace-grid">
        <form className="project-create-panel" onSubmit={handleSubmit}>
          <p className="eyebrow">NEW PRODUCTION</p>
          <h3>Create a project</h3>
          <p>Start a recoverable production workspace for your next story.</p>

          <label>
            Project name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. The Last Ember"
              disabled={creating}
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What are you creating?"
              rows={4}
              disabled={creating}
            />
          </label>

          <button className="primary-button" type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>

        <div className="project-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR PRODUCTIONS</p>
              <h3>Project library</h3>
            </div>
            <span>SQLite - Local-first</span>
          </div>

          {error && <div className="project-error">{error}</div>}

          {loading ? (
            <div className="empty-state">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">No projects yet. Create your first production.</div>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-card-mark">R</div>
                  <div className="project-card-copy">
                    <strong>{project.name}</strong>
                    <p>{project.description || "No description yet."}</p>
                    <small>{project.status === "active" ? "Active production" : "Archived"}</small>
                  </div>
                  <button className="secondary-button" type="button">
                    Open
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
