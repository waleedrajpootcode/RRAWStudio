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

  const fieldMap = Object.fromEntries(fields) as Record<
    (typeof fields)[number][0],
    string
  >;

  function renderField(
    key: (typeof fields)[number][0],
    wide = false,
  ) {
    return (
      <label
        className={`universe-field${wide ? " universe-field-wide" : ""}`}
        key={key}
      >
        <span>{fieldMap[key]}</span>
        <textarea
          value={draft[key]}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              [key]: event.target.value,
            }))
          }
          rows={key === "premise" ? 4 : 5}
          placeholder={`Define ${fieldMap[key].toLowerCase()}...`}
          disabled={loading || saving}
        />
      </label>
    );
  }

  return (
    <section className="projects-page universe-page">
      <div className="universe-header">
        <div>
          <p className="eyebrow">WORLD MEMORY / WORLD BIBLE</p>
          <h2>Universe</h2>
          <p>
            The canonical creative foundation for {project.name}. Characters,
            stories and scenes will inherit relevant world context from here.
          </p>
        </div>

        <div className="universe-header-actions">
          <span>{project.name}</span>
          <button
            className="primary-button"
            type="submit"
            form="universe-form"
            disabled={loading || saving}
          >
            {saving ? "Saving..." : "Save Universe"}
          </button>
        </div>
      </div>

      <form
        id="universe-form"
        className="universe-studio"
        onSubmit={handleSubmit}
      >
        <section className="universe-section universe-identity">
          <div className="universe-section-heading">
            <div>
              <p className="eyebrow">01 / IDENTITY</p>
              <h3>World Identity</h3>
            </div>
            <span>Core premise & narrative tone</span>
          </div>

          <div className="universe-grid">
            {renderField("premise", true)}
            {renderField("genre")}
            {renderField("tone")}
          </div>
        </section>

        <section className="universe-section">
          <div className="universe-section-heading">
            <div>
              <p className="eyebrow">02 / ART DIRECTION</p>
              <h3>Visual Language</h3>
            </div>
            <span>Style, color & atmosphere</span>
          </div>

          <div className="universe-grid">
            {renderField("visual_style")}
            {renderField("color_palette")}
            {renderField("atmosphere", true)}
          </div>
        </section>

        <section className="universe-section">
          <div className="universe-section-heading">
            <div>
              <p className="eyebrow">03 / CANON</p>
              <h3>World Rules</h3>
            </div>
            <span>Rules the production must respect</span>
          </div>

          <div className="universe-grid">
            {renderField("world_rules", true)}
          </div>
        </section>

        <section className="universe-section universe-dual-section">
          <div>
            <div className="universe-section-heading">
              <div>
                <p className="eyebrow">04 / HISTORY</p>
                <h3>Lore</h3>
              </div>
            </div>
            {renderField("lore")}
          </div>

          <div>
            <div className="universe-section-heading">
              <div>
                <p className="eyebrow">05 / CHRONOLOGY</p>
                <h3>Timeline</h3>
              </div>
            </div>
            {renderField("timeline")}
          </div>
        </section>

        {message && (
          <div className="universe-save-message" role="status">
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
