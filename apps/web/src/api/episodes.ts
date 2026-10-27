const API_BASE = "http://127.0.0.1:8000";

export type ProductionStatus = "draft" | "approved";

export type Episode = {
  id: string;
  project_id: string;
  story_id: string | null;
  episode_number: number;
  title: string;
  summary: string;
  status: ProductionStatus;
  created_at: string;
  updated_at: string;
};

export type EpisodeDraft = {
  episode_number: number;
  title: string;
  summary: string;
  story_id?: string | null;
  status: ProductionStatus;
};

export type Chapter = {
  id: string;
  episode_id: string;
  chapter_number: number;
  title: string;
  summary: string;
  status: ProductionStatus;
  created_at: string;
  updated_at: string;
};

export type ChapterDraft = {
  chapter_number: number;
  title: string;
  summary: string;
  status: ProductionStatus;
};

export type Scene = {
  id: string;
  chapter_id: string;
  scene_number: number;
  title: string;
  location: string;
  time_of_day: string;
  characters: string;
  actions: string;
  dialogue: string;
  emotion: string;
  lighting: string;
  atmosphere: string;
  camera_audio_intent: string;
  continuity: string;
  status: ProductionStatus;
  created_at: string;
  updated_at: string;
};

export type SceneDraft = {
  scene_number: number;
  title: string;
  location: string;
  time_of_day: string;
  characters: string;
  actions: string;
  dialogue: string;
  emotion: string;
  lighting: string;
  atmosphere: string;
  camera_audio_intent: string;
  continuity: string;
  status: ProductionStatus;
};

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Unable to complete production request.");
  }

  return response.json();
}

export function getEpisodes(projectId: string): Promise<Episode[]> {
  return request<Episode[]>(
    `${API_BASE}/api/projects/${projectId}/episodes`,
  );
}

export function createEpisode(
  projectId: string,
  payload: EpisodeDraft,
): Promise<Episode> {
  return request<Episode>(
    `${API_BASE}/api/projects/${projectId}/episodes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateEpisode(
  projectId: string,
  episodeId: string,
  payload: Partial<EpisodeDraft>,
): Promise<Episode> {
  return request<Episode>(
    `${API_BASE}/api/projects/${projectId}/episodes/${episodeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function getChapters(episodeId: string): Promise<Chapter[]> {
  return request<Chapter[]>(
    `${API_BASE}/api/episodes/${episodeId}/chapters`,
  );
}

export function createChapter(
  episodeId: string,
  payload: ChapterDraft,
): Promise<Chapter> {
  return request<Chapter>(
    `${API_BASE}/api/episodes/${episodeId}/chapters`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateChapter(
  episodeId: string,
  chapterId: string,
  payload: Partial<ChapterDraft>,
): Promise<Chapter> {
  return request<Chapter>(
    `${API_BASE}/api/episodes/${episodeId}/chapters/${chapterId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function getScenes(chapterId: string): Promise<Scene[]> {
  return request<Scene[]>(
    `${API_BASE}/api/chapters/${chapterId}/scenes`,
  );
}

export function createScene(
  chapterId: string,
  payload: SceneDraft,
): Promise<Scene> {
  return request<Scene>(
    `${API_BASE}/api/chapters/${chapterId}/scenes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateScene(
  chapterId: string,
  sceneId: string,
  payload: Partial<SceneDraft>,
): Promise<Scene> {
  return request<Scene>(
    `${API_BASE}/api/chapters/${chapterId}/scenes/${sceneId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}
