export type Universe = {
  id: string;
  project_id: string;
  premise: string;
  genre: string;
  tone: string;
  visual_style: string;
  color_palette: string;
  atmosphere: string;
  world_rules: string;
  lore: string;
  timeline: string;
  created_at: string;
  updated_at: string;
};

const API_BASE = "http://127.0.0.1:8000";

export async function getUniverse(
  projectId: string,
): Promise<Universe | null> {
  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/universe`,
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Unable to load universe.");
  }

  return response.json();
}

export async function saveUniverse(
  projectId: string,
  payload: Omit<
    Universe,
    "id" | "project_id" | "created_at" | "updated_at"
  >,
): Promise<Universe> {
  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/universe`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Unable to save universe.");
  }

  return response.json();
}
