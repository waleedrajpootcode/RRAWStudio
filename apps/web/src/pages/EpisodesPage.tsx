import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  createChapter,
  createEpisode,
  createScene,
  getChapters,
  getEpisodes,
  getScenes,
  updateChapter,
  updateEpisode,
  updateScene,
  type Chapter,
  type ChapterDraft,
  type Episode,
  type EpisodeDraft,
  type ProductionStatus,
  type Scene,
  type SceneDraft,
} from "../api/episodes";
import { useProject } from "../app/ProjectContext";
import "./EpisodesPage.css";

const EMPTY_SCENE: SceneDraft = {
  scene_number: 1,
  title: "",
  location: "",
  time_of_day: "",
  characters: "",
  actions: "",
  dialogue: "",
  emotion: "",
  lighting: "",
  atmosphere: "",
  camera_audio_intent: "",
  continuity: "",
  status: "draft",
};

function statusLabel(status: ProductionStatus) {
  return status === "approved" ? "Approved" : "Draft";
}

function nextNumber(items: Array<{ episode_number?: number; chapter_number?: number; scene_number?: number }>, key: "episode_number" | "chapter_number" | "scene_number") {
  return items.reduce((highest, item) => Math.max(highest, Number(item[key]) || 0), 0) + 1;
}

function inputValue(value: string | undefined | null) {
  return value ?? "";
}

export default function EpisodesPage() {
  const { project } = useProject();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const [episodeDraft, setEpisodeDraft] = useState<EpisodeDraft | null>(null);
  const [chapterDraft, setChapterDraft] = useState<ChapterDraft | null>(null);
  const [sceneDraft, setSceneDraft] = useState<SceneDraft | null>(null);

  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [saving, setSaving] = useState<"episode" | "chapter" | "scene" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!project) return;

    const projectId = project.id;
    let active = true;

    async function load() {
      setLoadingEpisodes(true);
      setError("");

      try {
        const data = await getEpisodes(projectId);
        if (!active) return;
        setEpisodes(data);
        setSelectedEpisodeId((current) =>
          current && data.some((item) => item.id === current)
            ? current
            : data[0]?.id ?? null,
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load episodes.",
          );
        }
      } finally {
        if (active) setLoadingEpisodes(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [project?.id]);

  useEffect(() => {
    const selected = episodes.find((item) => item.id === selectedEpisodeId);

    setEpisodeDraft(
      selected
        ? {
            episode_number: selected.episode_number,
            title: selected.title,
            summary: selected.summary,
            story_id: selected.story_id,
            status: selected.status,
          }
        : null,
    );
  }, [episodes, selectedEpisodeId]);

  useEffect(() => {
    if (!selectedEpisodeId) {
      setChapters([]);
      setSelectedChapterId(null);
      return;
    }

    const episodeId = selectedEpisodeId;
    let active = true;

    async function load() {
      setLoadingChapters(true);
      setError("");

      try {
        const data = await getChapters(episodeId);
        if (!active) return;
        setChapters(data);
        setSelectedChapterId((current) =>
          current && data.some((item) => item.id === current)
            ? current
            : data[0]?.id ?? null,
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load chapters.",
          );
        }
      } finally {
        if (active) setLoadingChapters(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [selectedEpisodeId]);

  useEffect(() => {
    const selected = chapters.find((item) => item.id === selectedChapterId);

    setChapterDraft(
      selected
        ? {
            chapter_number: selected.chapter_number,
            title: selected.title,
            summary: selected.summary,
            status: selected.status,
          }
        : null,
    );
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (!selectedChapterId) {
      setScenes([]);
      setSelectedSceneId(null);
      return;
    }

    const chapterId = selectedChapterId;
    let active = true;

    async function load() {
      setLoadingScenes(true);
      setError("");

      try {
        const data = await getScenes(chapterId);
        if (!active) return;
        setScenes(data);
        setSelectedSceneId((current) =>
          current && data.some((item) => item.id === current)
            ? current
            : data[0]?.id ?? null,
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load scenes.",
          );
        }
      } finally {
        if (active) setLoadingScenes(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [selectedChapterId]);

  useEffect(() => {
    const selected = scenes.find((item) => item.id === selectedSceneId);

    setSceneDraft(
      selected
        ? {
            scene_number: selected.scene_number,
            title: selected.title,
            location: selected.location,
            time_of_day: selected.time_of_day,
            characters: selected.characters,
            actions: selected.actions,
            dialogue: selected.dialogue,
            emotion: selected.emotion,
            lighting: selected.lighting,
            atmosphere: selected.atmosphere,
            camera_audio_intent: selected.camera_audio_intent,
            continuity: selected.continuity,
            status: selected.status,
          }
        : null,
    );
  }, [scenes, selectedSceneId]);

  async function handleNewEpisode() {
    if (!project) return;

    setError("");
    setNotice("");

    try {
      const created = await createEpisode(project.id, {
        episode_number: nextNumber(episodes, "episode_number"),
        title: `Episode ${nextNumber(episodes, "episode_number")}`,
        summary: "",
        status: "draft",
      });

      setEpisodes((current) =>
        [...current, created].sort((a, b) => a.episode_number - b.episode_number),
      );
      setSelectedEpisodeId(created.id);
      setNotice("Episode draft created.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create episode.",
      );
    }
  }

  async function handleSaveEpisode() {
    if (!project || !selectedEpisodeId || !episodeDraft) return;

    setSaving("episode");
    setError("");
    setNotice("");

    try {
      const updated = await updateEpisode(
        project.id,
        selectedEpisodeId,
        episodeDraft,
      );
      setEpisodes((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.episode_number - b.episode_number),
      );
      setNotice("Episode changes saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save episode.",
      );
    } finally {
      setSaving(null);
    }
  }

  async function handleNewChapter() {
    if (!selectedEpisodeId) return;

    setError("");
    setNotice("");

    try {
      const created = await createChapter(selectedEpisodeId, {
        chapter_number: nextNumber(chapters, "chapter_number"),
        title: `Chapter ${nextNumber(chapters, "chapter_number")}`,
        summary: "",
        status: "draft",
      });

      setChapters((current) =>
        [...current, created].sort((a, b) => a.chapter_number - b.chapter_number),
      );
      setSelectedChapterId(created.id);
      setNotice("Chapter draft created.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create chapter.",
      );
    }
  }

  async function handleSaveChapter() {
    if (!selectedEpisodeId || !selectedChapterId || !chapterDraft) return;

    setSaving("chapter");
    setError("");
    setNotice("");

    try {
      const updated = await updateChapter(
        selectedEpisodeId,
        selectedChapterId,
        chapterDraft,
      );
      setChapters((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.chapter_number - b.chapter_number),
      );
      setNotice("Chapter changes saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save chapter.",
      );
    } finally {
      setSaving(null);
    }
  }

  async function handleNewScene() {
    if (!selectedChapterId) return;

    setError("");
    setNotice("");

    try {
      const number = nextNumber(scenes, "scene_number");
      const created = await createScene(selectedChapterId, {
        ...EMPTY_SCENE,
        scene_number: number,
        title: `Scene ${number}`,
      });

      setScenes((current) =>
        [...current, created].sort((a, b) => a.scene_number - b.scene_number),
      );
      setSelectedSceneId(created.id);
      setNotice("Scene draft created.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create scene.",
      );
    }
  }

  async function handleSaveScene() {
    if (!selectedChapterId || !selectedSceneId || !sceneDraft) return;

    setSaving("scene");
    setError("");
    setNotice("");

    try {
      const updated = await updateScene(
        selectedChapterId,
        selectedSceneId,
        sceneDraft,
      );
      setScenes((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.scene_number - b.scene_number),
      );
      setNotice("Scene changes saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save scene.",
      );
    } finally {
      setSaving(null);
    }
  }

  function updateSceneField<K extends keyof SceneDraft>(
    field: K,
    value: SceneDraft[K],
  ) {
    setSceneDraft((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  function handleStatusChange(
    event: ChangeEvent<HTMLSelectElement>,
    setter: (value: ProductionStatus) => void,
  ) {
    setter(event.target.value as ProductionStatus);
  }

  const selectedEpisode = episodes.find(
    (item) => item.id === selectedEpisodeId,
  );
  const selectedChapter = chapters.find(
    (item) => item.id === selectedChapterId,
  );
  const selectedScene = scenes.find((item) => item.id === selectedSceneId);

  return (
    <main className="episode-studio-page">
      <header className="episode-studio-hero">
        <div>
          <div className="episode-studio-eyebrow">EPISODE STUDIO</div>
          <h1>Build the production, one chapter at a time.</h1>
          <p>
            Shape episodes, structure chapters and direct production-ready
            scenes without losing the hierarchy of the story.
          </p>
        </div>
        <div className="episode-studio-project-badge">
          <span>PROJECT</span>
          <strong>{project?.name ?? "Project"}</strong>
        </div>
      </header>

      {(error || notice) && (
        <div className={`episode-studio-notice ${error ? "is-error" : ""}`}>
          {error || notice}
        </div>
      )}

      <section className="episode-studio-grid">
        <aside className="episode-studio-panel episode-rail">
          <div className="episode-panel-header">
            <div>
              <span className="episode-panel-kicker">PRODUCTION</span>
              <h2>Episodes</h2>
            </div>
            <button
              className="episode-primary-button episode-small-button"
              type="button"
              onClick={() => void handleNewEpisode()}
            >
              + New
            </button>
          </div>

          {loadingEpisodes ? (
            <div className="episode-empty-state">Loading episodes?</div>
          ) : episodes.length === 0 ? (
            <div className="episode-empty-state">
              <strong>No episodes yet.</strong>
              <span>Create the first production unit to begin.</span>
            </div>
          ) : (
            <div className="episode-list">
              {episodes.map((episode) => (
                <button
                  key={episode.id}
                  className={`episode-list-item ${
                    episode.id === selectedEpisodeId ? "is-active" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedEpisodeId(episode.id);
                    setNotice("");
                    setError("");
                  }}
                >
                  <span className="episode-list-number">
                    {String(episode.episode_number).padStart(2, "0")}
                  </span>
                  <span className="episode-list-copy">
                    <strong>{episode.title || "Untitled Episode"}</strong>
                    <small>{statusLabel(episode.status)}</small>
                  </span>
                  <span className="episode-list-chevron">?</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="episode-studio-panel chapter-panel">
          <div className="episode-panel-header">
            <div>
              <span className="episode-panel-kicker">STRUCTURE</span>
              <h2>Chapters</h2>
            </div>
            <button
              className="episode-secondary-button episode-small-button"
              type="button"
              disabled={!selectedEpisodeId}
              onClick={() => void handleNewChapter()}
            >
              + Chapter
            </button>
          </div>

          {selectedEpisode && (
            <div className="episode-context-card">
              <span>
                EPISODE {String(selectedEpisode.episode_number).padStart(2, "0")}
              </span>
              <strong>{selectedEpisode.title || "Untitled Episode"}</strong>
            </div>
          )}

          {loadingChapters ? (
            <div className="episode-empty-state">Loading chapters?</div>
          ) : chapters.length === 0 ? (
            <div className="episode-empty-state">
              <strong>No chapters yet.</strong>
              <span>Add a chapter to start directing scenes.</span>
            </div>
          ) : (
            <div className="chapter-list">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  className={`chapter-list-item ${
                    chapter.id === selectedChapterId ? "is-active" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedChapterId(chapter.id);
                    setNotice("");
                    setError("");
                  }}
                >
                  <span className="chapter-number">
                    {String(chapter.chapter_number).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{chapter.title || "Untitled Chapter"}</strong>
                    <small>{statusLabel(chapter.status)}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {chapterDraft && selectedChapterId && (
            <div className="episode-editor-card">
              <div className="episode-editor-heading">
                <div>
                  <span className="episode-panel-kicker">CHAPTER EDITOR</span>
                  <h3>Chapter details</h3>
                </div>
                <span className="episode-status-chip">
                  {statusLabel(chapterDraft.status)}
                </span>
              </div>

              <div className="episode-form-grid compact">
                <label>
                  <span>Chapter number</span>
                  <input
                    type="number"
                    min="1"
                    value={chapterDraft.chapter_number}
                    onChange={(event) =>
                      setChapterDraft({
                        ...chapterDraft,
                        chapter_number: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={chapterDraft.status}
                    onChange={(event) =>
                      handleStatusChange(event, (value) =>
                        setChapterDraft({ ...chapterDraft, status: value }),
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                  </select>
                </label>
              </div>

              <label>
                <span>Title</span>
                <input
                  value={chapterDraft.title}
                  onChange={(event) =>
                    setChapterDraft({
                      ...chapterDraft,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>Summary</span>
                <textarea
                  rows={4}
                  value={chapterDraft.summary}
                  onChange={(event) =>
                    setChapterDraft({
                      ...chapterDraft,
                      summary: event.target.value,
                    })
                  }
                />
              </label>

              <button
                className="episode-primary-button"
                type="button"
                disabled={saving === "chapter"}
                onClick={() => void handleSaveChapter()}
              >
                {saving === "chapter" ? "Saving?" : "Save Chapter"}
              </button>
            </div>
          )}
        </section>

        <section className="episode-studio-panel scene-panel">
          <div className="episode-panel-header">
            <div>
              <span className="episode-panel-kicker">DIRECTOR</span>
              <h2>Scenes</h2>
            </div>
            <button
              className="episode-primary-button episode-small-button"
              type="button"
              disabled={!selectedChapterId}
              onClick={() => void handleNewScene()}
            >
              + Scene
            </button>
          </div>

          {selectedChapter && (
            <div className="scene-breadcrumb">
              <span>
                EP {String(selectedEpisode?.episode_number ?? 0).padStart(2, "0")}
              </span>
              <b>?</b>
              <span>
                CH {String(selectedChapter.chapter_number).padStart(2, "0")}
              </span>
              <strong>{selectedChapter.title || "Untitled Chapter"}</strong>
            </div>
          )}

          {loadingScenes ? (
            <div className="episode-empty-state">Loading scenes?</div>
          ) : scenes.length === 0 ? (
            <div className="episode-empty-state">
              <strong>No scenes yet.</strong>
              <span>Create a scene and begin directing the shot intent.</span>
            </div>
          ) : (
            <div className="scene-strip">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  className={`scene-strip-item ${
                    scene.id === selectedSceneId ? "is-active" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    setNotice("");
                    setError("");
                  }}
                >
                  <span>
                    SC {String(scene.scene_number).padStart(2, "0")}
                  </span>
                  <strong>{scene.title || "Untitled Scene"}</strong>
                </button>
              ))}
            </div>
          )}

          {sceneDraft && selectedScene && (
            <div className="episode-editor-card scene-editor">
              <div className="episode-editor-heading">
                <div>
                  <span className="episode-panel-kicker">SCENE DIRECTOR</span>
                  <h3>{sceneDraft.title || "Untitled Scene"}</h3>
                </div>
                <span className="episode-status-chip">
                  {statusLabel(sceneDraft.status)}
                </span>
              </div>

              <div className="episode-form-grid compact">
                <label>
                  <span>Scene number</span>
                  <input
                    type="number"
                    min="1"
                    value={sceneDraft.scene_number}
                    onChange={(event) =>
                      updateSceneField(
                        "scene_number",
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={sceneDraft.status}
                    onChange={(event) =>
                      handleStatusChange(event, (value) =>
                        updateSceneField("status", value),
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                  </select>
                </label>
              </div>

              <label>
                <span>Scene title</span>
                <input
                  value={sceneDraft.title}
                  onChange={(event) =>
                    updateSceneField("title", event.target.value)
                  }
                />
              </label>

              <div className="episode-form-grid">
                <label>
                  <span>Location</span>
                  <input
                    value={sceneDraft.location}
                    onChange={(event) =>
                      updateSceneField("location", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Time of day</span>
                  <input
                    value={sceneDraft.time_of_day}
                    onChange={(event) =>
                      updateSceneField("time_of_day", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Characters</span>
                  <input
                    value={sceneDraft.characters}
                    onChange={(event) =>
                      updateSceneField("characters", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Emotion</span>
                  <input
                    value={sceneDraft.emotion}
                    onChange={(event) =>
                      updateSceneField("emotion", event.target.value)
                    }
                  />
                </label>
              </div>

              <label>
                <span>Actions</span>
                <textarea
                  rows={4}
                  value={sceneDraft.actions}
                  onChange={(event) =>
                    updateSceneField("actions", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Dialogue</span>
                <textarea
                  rows={4}
                  value={sceneDraft.dialogue}
                  onChange={(event) =>
                    updateSceneField("dialogue", event.target.value)
                  }
                />
              </label>

              <div className="episode-form-grid">
                <label>
                  <span>Lighting</span>
                  <input
                    value={sceneDraft.lighting}
                    onChange={(event) =>
                      updateSceneField("lighting", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>Atmosphere</span>
                  <input
                    value={sceneDraft.atmosphere}
                    onChange={(event) =>
                      updateSceneField("atmosphere", event.target.value)
                    }
                  />
                </label>
              </div>

              <label>
                <span>Camera / audio intent</span>
                <textarea
                  rows={3}
                  value={sceneDraft.camera_audio_intent}
                  onChange={(event) =>
                    updateSceneField(
                      "camera_audio_intent",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Continuity</span>
                <textarea
                  rows={3}
                  value={sceneDraft.continuity}
                  onChange={(event) =>
                    updateSceneField("continuity", event.target.value)
                  }
                />
              </label>

              <button
                className="episode-primary-button"
                type="button"
                disabled={saving === "scene"}
                onClick={() => void handleSaveScene()}
              >
                {saving === "scene" ? "Saving?" : "Save Scene"}
              </button>
            </div>
          )}
        </section>

        <section className="episode-studio-panel episode-details-panel">
          <div className="episode-editor-heading">
            <div>
              <span className="episode-panel-kicker">EPISODE EDITOR</span>
              <h3>{selectedEpisode?.title || "Select an episode"}</h3>
            </div>
            {episodeDraft && (
              <span className="episode-status-chip">
                {statusLabel(episodeDraft.status)}
              </span>
            )}
          </div>

          {episodeDraft && selectedEpisodeId ? (
            <>
              <div className="episode-form-grid compact">
                <label>
                  <span>Episode number</span>
                  <input
                    type="number"
                    min="1"
                    value={episodeDraft.episode_number}
                    onChange={(event) =>
                      setEpisodeDraft({
                        ...episodeDraft,
                        episode_number: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={episodeDraft.status}
                    onChange={(event) =>
                      handleStatusChange(event, (value) =>
                        setEpisodeDraft({ ...episodeDraft, status: value }),
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                  </select>
                </label>
              </div>

              <label>
                <span>Title</span>
                <input
                  value={episodeDraft.title}
                  onChange={(event) =>
                    setEpisodeDraft({
                      ...episodeDraft,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>Episode summary</span>
                <textarea
                  rows={8}
                  value={episodeDraft.summary}
                  onChange={(event) =>
                    setEpisodeDraft({
                      ...episodeDraft,
                      summary: event.target.value,
                    })
                  }
                />
              </label>

              <button
                className="episode-primary-button"
                type="button"
                disabled={saving === "episode"}
                onClick={() => void handleSaveEpisode()}
              >
                {saving === "episode" ? "Saving?" : "Save Episode"}
              </button>
            </>
          ) : (
            <div className="episode-empty-state">
              <strong>Select an episode.</strong>
              <span>The production hierarchy will appear here.</span>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
