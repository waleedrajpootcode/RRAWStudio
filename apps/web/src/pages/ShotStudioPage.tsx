import { useEffect, useMemo, useState } from "react";
import { useProject } from "../app/ProjectContext";
import {
  createShot,
  getShots,
  updateShot,
  type Shot,
  type ShotDraft,
} from "../api/shots";
import {
  getEpisodes,
  getChapters,
  getScenes,
  type Episode,
  type Chapter,
  type Scene,
} from "../api/episodes";
import "./ShotStudioPage.css";

const emptyShot: ShotDraft = {
  shot_number: 1,
  title: "",
  duration: 4,
  camera: "",
  composition: "",
  characters: "",
  poses: "",
  emotion: "",
  dialogue: "",
  background: "",
  midground: "",
  foreground: "",
  effects: "",
  lighting: "",
  motion: "",
  transition: "",
  music: "",
  sfx: "",
  render_settings: "",
  status: "draft",
};

function draftFromShot(shot: Shot): ShotDraft {
  return {
    shot_number: shot.shot_number,
    title: shot.title,
    duration: shot.duration,
    camera: shot.camera,
    composition: shot.composition,
    characters: shot.characters,
    poses: shot.poses,
    emotion: shot.emotion,
    dialogue: shot.dialogue,
    background: shot.background,
    midground: shot.midground,
    foreground: shot.foreground,
    effects: shot.effects,
    lighting: shot.lighting,
    motion: shot.motion,
    transition: shot.transition,
    music: shot.music,
    sfx: shot.sfx,
    render_settings: shot.render_settings,
    status: shot.status,
  };
}

export default function ShotStudioPage() {
  const { project } = useProject();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);

  const [selectedEpisodeId, setSelectedEpisodeId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [selectedShotId, setSelectedShotId] = useState("");

  const [draft, setDraft] = useState<ShotDraft>(emptyShot);
  const [loading, setLoading] = useState(true);
  const [shotsLoading, setShotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!project?.id) return;

    setLoading(true);
    getEpisodes(project.id)
      .then((items) => {
        setEpisodes(items);
        setSelectedEpisodeId(items[0]?.id ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load episodes."))
      .finally(() => setLoading(false));
  }, [project?.id]);

  useEffect(() => {
    if (!selectedEpisodeId) {
      setChapters([]);
      setSelectedChapterId("");
      return;
    }

    getChapters(selectedEpisodeId)
      .then((items) => {
        setChapters(items);
        setSelectedChapterId(items[0]?.id ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load chapters."));
  }, [selectedEpisodeId]);

  useEffect(() => {
    if (!selectedChapterId) {
      setScenes([]);
      setSelectedSceneId("");
      return;
    }

    getScenes(selectedChapterId)
      .then((items) => {
        setScenes(items);
        setSelectedSceneId(items[0]?.id ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load scenes."));
  }, [selectedChapterId]);

  useEffect(() => {
    if (!selectedSceneId) {
      setShots([]);
      setSelectedShotId("");
      setDraft(emptyShot);
      return;
    }

    setShotsLoading(true);
    setError("");

    getShots(selectedSceneId)
      .then((items) => {
        setShots(items);
        setSelectedShotId(items[0]?.id ?? "");
        setDraft(items[0] ? draftFromShot(items[0]) : {
          ...emptyShot,
          shot_number: 1,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load shots."))
      .finally(() => setShotsLoading(false));
  }, [selectedSceneId]);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? null,
    [scenes, selectedSceneId],
  );

  function selectShot(shot: Shot) {
    setSelectedShotId(shot.id);
    setDraft(draftFromShot(shot));
    setNotice("");
    setError("");
  }

  function startNewShot() {
    const nextNumber =
      shots.reduce((highest, shot) => Math.max(highest, shot.shot_number), 0) + 1;

    setSelectedShotId("");
    setDraft({
      ...emptyShot,
      shot_number: nextNumber,
    });
    setNotice("");
    setError("");
  }

  async function handleSave() {
    if (!selectedSceneId) {
      setError("Select a scene before saving a shot.");
      return;
    }

    setSaving(true);
    setNotice("");
    setError("");

    try {
      if (selectedShotId) {
        const updated = await updateShot(
          selectedSceneId,
          selectedShotId,
          draft,
        );
        setShots((current) =>
          current.map((shot) => (shot.id === updated.id ? updated : shot)),
        );
        setDraft(draftFromShot(updated));
        setNotice("Shot saved.");
      } else {
        const created = await createShot(selectedSceneId, draft);
        setShots((current) => [...current, created].sort((a, b) => a.shot_number - b.shot_number));
        setSelectedShotId(created.id);
        setDraft(draftFromShot(created));
        setNotice("Shot created.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save shot.");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ShotDraft>(field: K, value: ShotDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  if (loading) {
    return <section className="shot-studio-page"><div className="shot-studio-empty">Loading Shot Studio?</div></section>;
  }

  return (
    <section className="shot-studio-page">
      <div className="shot-studio-hero">
        <div>
          <span className="shot-studio-eyebrow">SHOT STUDIO</span>
          <h1>Build the renderable moments.</h1>
          <p>
            Turn each scene into controlled, production-ready shots with camera,
            staging, layers, motion and render intent.
          </p>
        </div>

        <div className="shot-studio-project-badge">
          <span>PROJECT</span>
          <strong>{project?.name ?? "Project"}</strong>
          <small>{selectedScene?.title ?? "No scene selected"}</small>
        </div>
      </div>

      {notice && <div className="shot-studio-notice">{notice}</div>}
      {error && <div className="shot-studio-notice is-error">{error}</div>}

      <div className="shot-studio-grid">
        <aside className="shot-studio-panel shot-context-panel">
          <div className="shot-panel-header">
            <div>
              <span className="shot-panel-kicker">SCENE CONTEXT</span>
              <h2>Production tree</h2>
            </div>
          </div>

          <div className="shot-select-stack">
            <label>
              <span>Episode</span>
              <select value={selectedEpisodeId} onChange={(event) => setSelectedEpisodeId(event.target.value)}>
                <option value="">Select episode</option>
                {episodes.map((episode) => (
                  <option key={episode.id} value={episode.id}>
                    E{String(episode.episode_number).padStart(2, "0")} ? {episode.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Chapter</span>
              <select value={selectedChapterId} onChange={(event) => setSelectedChapterId(event.target.value)}>
                <option value="">Select chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    C{String(chapter.chapter_number).padStart(2, "0")} ? {chapter.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Scene</span>
              <select value={selectedSceneId} onChange={(event) => setSelectedSceneId(event.target.value)}>
                <option value="">Select scene</option>
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    S{String(scene.scene_number).padStart(2, "0")} ? {scene.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="shot-context-summary">
            <span>SCENE INTENT</span>
            <strong>{selectedScene?.location || "No location set"}</strong>
            <p>{selectedScene?.actions || "Scene action will appear here."}</p>
          </div>
        </aside>

        <section className="shot-studio-panel shot-rail-panel">
          <div className="shot-panel-header">
            <div>
              <span className="shot-panel-kicker">SHOT RAIL</span>
              <h2>{shots.length} shots</h2>
            </div>
            <button className="shot-primary-button shot-small-button" type="button" onClick={startNewShot} disabled={!selectedSceneId}>
              + New Shot
            </button>
          </div>

          <div className="shot-list">
            {shotsLoading ? (
              <div className="shot-list-empty">Loading shots?</div>
            ) : shots.length ? (
              shots.map((shot) => (
                <button
                  className={`shot-list-item${selectedShotId === shot.id ? " is-active" : ""}`}
                  key={shot.id}
                  type="button"
                  onClick={() => selectShot(shot)}
                >
                  <span className="shot-number">SH {String(shot.shot_number).padStart(2, "0")}</span>
                  <strong>{shot.title || "Untitled shot"}</strong>
                  <small>{shot.duration.toFixed(1)}s ? {shot.status}</small>
                </button>
              ))
            ) : (
              <div className="shot-list-empty">No shots yet. Create the first renderable moment.</div>
            )}
          </div>
        </section>

        <section className="shot-studio-panel shot-editor-panel">
          <div className="shot-editor-header">
            <div>
              <span className="shot-panel-kicker">SHOT DIRECTOR</span>
              <h2>{selectedShotId ? `Shot ${draft.shot_number}` : `New Shot ${draft.shot_number}`}</h2>
            </div>
            <button className="shot-primary-button" type="button" onClick={handleSave} disabled={saving || !selectedSceneId}>
              {saving ? "Saving?" : selectedShotId ? "Save Shot" : "Create Shot"}
            </button>
          </div>

          <div className="shot-form">
            <div className="shot-form-row shot-form-row-top">
              <Field label="Shot number" value={draft.shot_number} type="number" onChange={(value) => updateField("shot_number", Number(value))} />
              <Field label="Duration (seconds)" value={draft.duration} type="number" step="0.1" onChange={(value) => updateField("duration", Number(value))} />
              <TextField label="Title" value={draft.title} onChange={(value) => updateField("title", value)} />
              <label className="shot-field">
                <span>Status</span>
                <select value={draft.status} onChange={(event) => updateField("status", event.target.value as ShotDraft["status"])}>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                </select>
              </label>
            </div>

            <Section title="Camera & Composition">
              <TextField label="Camera" value={draft.camera} onChange={(value) => updateField("camera", value)} />
              <TextField label="Composition" value={draft.composition} onChange={(value) => updateField("composition", value)} />
            </Section>

            <Section title="Performance & Dialogue">
              <TextArea label="Characters" value={draft.characters} onChange={(value) => updateField("characters", value)} />
              <TextArea label="Poses" value={draft.poses} onChange={(value) => updateField("poses", value)} />
              <TextField label="Emotion" value={draft.emotion} onChange={(value) => updateField("emotion", value)} />
              <TextArea label="Dialogue" value={draft.dialogue} onChange={(value) => updateField("dialogue", value)} />
            </Section>

            <Section title="2.5D Layers">
              <TextArea label="Background" value={draft.background} onChange={(value) => updateField("background", value)} />
              <TextArea label="Midground" value={draft.midground} onChange={(value) => updateField("midground", value)} />
              <TextArea label="Foreground" value={draft.foreground} onChange={(value) => updateField("foreground", value)} />
            </Section>

            <Section title="Visual Direction">
              <TextField label="Lighting" value={draft.lighting} onChange={(value) => updateField("lighting", value)} />
              <TextArea label="Effects" value={draft.effects} onChange={(value) => updateField("effects", value)} />
              <TextArea label="Motion" value={draft.motion} onChange={(value) => updateField("motion", value)} />
              <TextField label="Transition" value={draft.transition} onChange={(value) => updateField("transition", value)} />
            </Section>

            <Section title="Audio & Render">
              <TextArea label="Music" value={draft.music} onChange={(value) => updateField("music", value)} />
              <TextArea label="SFX" value={draft.sfx} onChange={(value) => updateField("sfx", value)} />
              <TextArea label="Render settings" value={draft.render_settings} onChange={(value) => updateField("render_settings", value)} />
            </Section>
          </div>
        </section>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  type = "text",
  step,
  onChange,
}: {
  label: string;
  value: number;
  type?: string;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="shot-field">
      <span>{label}</span>
      <input type={type} step={step} value={value} onChange={(event) => onChange(event.target.value)} min={type === "number" ? 0 : undefined} />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="shot-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="shot-field shot-field-wide">
      <span>{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="shot-form-section">
      <div className="shot-form-section-heading">
        <span>{title}</span>
      </div>
      <div className="shot-form-grid">{children}</div>
    </section>
  );
}
