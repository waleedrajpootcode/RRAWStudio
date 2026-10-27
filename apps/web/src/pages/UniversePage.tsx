import { FormEvent, useEffect, useState } from "react";
import { getUniverse, saveUniverse, type Universe } from "../api/universe";
import { useProject } from "../app/ProjectContext";

const fields = [
  ["premise", "Premise"],
  ["genre", "Genre"],
  ["tone", "Tone"],
  ["visual_style", "Visual style"],
  ["color_palette", "Color palette"],
  ["atmosphere", "Atmosphere"],
  ["world_rules", "World rules"],
  ["lore", "Lore"],
  ["timeline", "Timeline"],
] as const;

type UniverseDraft = Omit<
  Universe,
  "id" | "project_id" | "created_at" | "updated_at"
>;

const emptyDraft: UniverseDraft = {
  premise: "",
  genre: "",
  tone: "",
  visual_style: "",
  color_palette: "",
  atmosphere: "",
  world_rules: "",
  lore: "",
  timeline: "",
};

export default function UniversePage() {
  const { project } = useProject();
  const [draft, setDraft] = useState<UniverseDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!project) {
      return;
    }

    const projectId = project.id;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");

      try {
        const universe = await getUniverse(projectId);

        if (!cancelled && universe) {
          setDraft({
            premise: universe.premise,
            genre: universe.genre,
            tone: universe.tone,
            visual_style: universe.visual_style,
            color_palette: universe.color_palette,
            atmosphere: universe.atmosphere,
            world_rules: universe.world_rules,
            lore: universe.lore,
            timeline: universe.timeline,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load universe.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [project]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!project) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await saveUniverse(project.id, draft);
      setMessage("Universe saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save universe.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!project) {
    return <section className="projects-page">Project context unavailable.</section>;
  }

  return (
    <section className="projects-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">WORLD MEMORY</p>
          <h2>Universe</h2>
        </div>
        <span>{project.name}</span>
      </div>

      <form className="project-workspace-grid" onSubmit={handleSubmit}>
        <div className="project-create-panel">
          <p className="eyebrow">UNIVERSE FOUNDATION</p>
          <h3>Define the world.</h3>
          <p>
            Capture the creative rules and identity that future stories,
            characters and scenes can inherit.
          </p>

          <button className="primary-button" type="submit" disabled={loading || saving}>
            {saving ? "Saving..." : "Save Universe"}
          </button>

          {message && <div className="project-error">{message}</div>}
        </div>

        <div className="project-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WORLD BIBLE</p>
              <h3>Creative direction</h3>
            </div>
            <span>Project-bound memory</span>
          </div>

          <div className="project-list">
            {fields.map(([key, label]) => (
              <label className="project-card" key={key}>
                <div className="project-card-copy">
                  <strong>{label}</strong>
                  <textarea
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    rows={key === "premise" ? 3 : 2}
                    placeholder={`Define ${label.toLowerCase()}...`}
                    disabled={loading || saving}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}
