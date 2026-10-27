export type Story = {
  id: string;
  project_id: string;
  concept: string;
  logline: string;
  theme: string;
  summary: string;
  genre: string;
  tone: string;
  narrative_direction: string;
  status: "draft" | "approved";
  created_at: string;
  updated_at: string;
};

export type StoryDraft = {
  concept: string;
  logline: string;
  theme: string;
  summary: string;
  genre: string;
  tone: string;
  narrative_direction: string;
  status: "draft" | "approved";
};

const API_BASE = "http://127.0.0.1:8000";

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Unable to complete story request.");
  }

  return response.json();
}

export function getStory(projectId: string): Promise<Story | null> {
  return request<Story | null>(
    `${API_BASE}/api/projects/${projectId}/story`,
  );
}

export function saveStory(
  projectId: string,
  payload: StoryDraft,
): Promise<Story> {
  return request<Story>(
    `${API_BASE}/api/projects/${projectId}/story`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}
