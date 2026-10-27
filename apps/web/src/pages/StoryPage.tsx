import { FormEvent, useEffect, useState } from "react";
import { getStory, saveStory, type StoryDraft } from "../api/story";
import { useProject } from "../app/ProjectContext";

const emptyStory: StoryDraft = {
  concept: "",
  logline: "",
  theme: "",
  summary: "",
  genre: "",
  tone: "",
  narrative_direction: "",
  status: "draft",
};

export default function StoryPage() {
  const { project, loading: projectLoading, error: projectError } = useProject();

  const [form, setForm] = useState<StoryDraft>(emptyStory);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!project) {
      return;
    }

    let cancelled = false;
    const projectId = project.id;

    async function loadStory() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const story = await getStory(projectId);

        if (!cancelled) {
          setForm(
            story
              ? {
                  concept: story.concept,
                  logline: story.logline,
                  theme: story.theme,
                  summary: story.summary,
                  genre: story.genre,
                  tone: story.tone,
                  narrative_direction: story.narrative_direction,
                  status: story.status,
                }
              : emptyStory,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load story.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStory();

    return () => {
      cancelled = true;
    };
  }, [project]);

  function updateField(field: keyof StoryDraft, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!project) {
      return;
    }

    const projectId = project.id;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveStory(projectId, form);
      setMessage("Story saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save story.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (projectLoading) {
    return <div className="studio-loading">Loading project?</div>;
  }

  if (projectError) {
    return <div className="studio-error">{projectError}</div>;
  }

  if (!project) {
    return <div className="studio-error">Project not found.</div>;
  }

  if (loading) {
    return <div className="studio-loading">Loading story?</div>;
  }

  return (
    <section className="story-studio">
      <header className="story-hero">
        <div>
          <div className="story-eyebrow">STORY ENGINE / NARRATIVE CORE</div>
          <h1>Story Studio</h1>
          <p>
            Shape the narrative foundation before episodes, scenes and shots
            are produced.
          </p>
        </div>

        <div className="story-project">
          <span>PROJECT</span>
          <strong>{project.name}</strong>
        </div>
      </header>

      <form className="story-form" onSubmit={handleSubmit}>
        <div className="story-status-bar">
          <div>
            <span className="story-section-kicker">PRODUCTION STATE</span>
            <strong>
              {form.status === "approved"
                ? "Approved story foundation"
                : "Draft story foundation"}
            </strong>
          </div>

          <select
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value)
            }
            aria-label="Story status"
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div className="story-grid">
          <section className="story-panel story-panel-wide">
            <div className="story-panel-heading">
              <div>
                <span className="story-section-kicker">01 / STORY IDENTITY</span>
                <h2>Core premise</h2>
              </div>
              <span>FOUNDATION</span>
            </div>

            <label>
              Concept
              <textarea
                rows={4}
                value={form.concept}
                onChange={(event) =>
                  updateField("concept", event.target.value)
                }
                placeholder="What is the story fundamentally about?"
              />
            </label>

            <label>
              Logline
              <textarea
                rows={4}
                value={form.logline}
                onChange={(event) =>
                  updateField("logline", event.target.value)
                }
                placeholder="The central dramatic promise in one or two sentences."
              />
            </label>

            <div className="story-two-column">
              <label>
                Genre
                <input
                  value={form.genre}
                  onChange={(event) =>
                    updateField("genre", event.target.value)
                  }
                  placeholder="Fantasy Adventure"
                />
              </label>

              <label>
                Tone
                <input
                  value={form.tone}
                  onChange={(event) =>
                    updateField("tone", event.target.value)
                  }
                  placeholder="Cinematic, mysterious, emotional"
                />
              </label>
            </div>
          </section>

          <section className="story-panel">
            <div className="story-panel-heading">
              <div>
                <span className="story-section-kicker">02 / NARRATIVE CORE</span>
                <h2>Meaning & direction</h2>
              </div>
            </div>

            <label>
              Theme
              <textarea
                rows={5}
                value={form.theme}
                onChange={(event) =>
                  updateField("theme", event.target.value)
                }
                placeholder="What should the audience feel or understand?"
              />
            </label>

            <label>
              Narrative Direction
              <textarea
                rows={7}
                value={form.narrative_direction}
                onChange={(event) =>
                  updateField("narrative_direction", event.target.value)
                }
                placeholder="Pacing, dramatic movement, escalation and storytelling intent."
              />
            </label>
          </section>

          <section className="story-panel story-panel-wide">
            <div className="story-panel-heading">
              <div>
                <span className="story-section-kicker">03 / STORY BIBLE</span>
                <h2>Summary</h2>
              </div>
              <span>LONG-FORM READY</span>
            </div>

            <label>
              Story Summary
              <textarea
                rows={8}
                value={form.summary}
                onChange={(event) =>
                  updateField("summary", event.target.value)
                }
                placeholder="Capture the complete current story direction. Episodes and scenes will build from this foundation."
              />
            </label>
          </section>
        </div>

        <footer className="story-footer">
          <div>
            {error && <span className="story-message story-message-error">{error}</span>}
            {!error && message && (
              <span className="story-message">{message}</span>
            )}
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving?" : "Save Story"}
          </button>
        </footer>
      </form>
    </section>
  );
}
