export type ProductionStatus = "draft" | "approved";

export type Shot = {
  id: string;
  scene_id: string;
  shot_number: number;
  title: string;
  duration: number;
  camera: string;
  composition: string;
  characters: string;
  poses: string;
  emotion: string;
  dialogue: string;
  background: string;
  midground: string;
  foreground: string;
  effects: string;
  lighting: string;
  motion: string;
  transition: string;
  music: string;
  sfx: string;
  render_settings: string;
  status: ProductionStatus;
  created_at: string;
  updated_at: string;
};

export type ShotDraft = {
  shot_number: number;
  title: string;
  duration: number;
  camera: string;
  composition: string;
  characters: string;
  poses: string;
  emotion: string;
  dialogue: string;
  background: string;
  midground: string;
  foreground: string;
  effects: string;
  lighting: string;
  motion: string;
  transition: string;
  music: string;
  sfx: string;
  render_settings: string;
  status: ProductionStatus;
};

const API_BASE = "http://127.0.0.1:8001";

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Unable to complete shot request.");
  }

  return response.json();
}

export function getShots(sceneId: string): Promise<Shot[]> {
  return request<Shot[]>(
    `${API_BASE}/api/scenes/${sceneId}/shots`,
  );
}

export function createShot(
  sceneId: string,
  payload: ShotDraft,
): Promise<Shot> {
  return request<Shot>(
    `${API_BASE}/api/scenes/${sceneId}/shots`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateShot(
  sceneId: string,
  shotId: string,
  payload: Partial<ShotDraft>,
): Promise<Shot> {
  return request<Shot>(
    `${API_BASE}/api/scenes/${sceneId}/shots/${shotId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}
