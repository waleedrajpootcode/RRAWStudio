export type Character = {
  id: string;
  project_id: string;
  name: string;
  role: string;
  age: string;
  personality: string;
  appearance: string;
  hair: string;
  eyes: string;
  skin: string;
  body: string;
  clothing: string;
  colors: string;
  visual_style: string;
  voice: string;
  relationships: string;
  character_arc: string;
  facts: string;
  created_at: string;
  updated_at: string;
};

export type CharacterDraft = Omit<
  Character,
  "id" | "project_id" | "created_at" | "updated_at"
>;

const API_BASE = "http://127.0.0.1:8001";

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? "Unable to complete character request.");
  }

  return response.json();
}

export function listCharacters(projectId: string): Promise<Character[]> {
  return request<Character[]>(
    `${API_BASE}/api/projects/${projectId}/characters`,
  );
}

export function createCharacter(
  projectId: string,
  payload: CharacterDraft,
): Promise<Character> {
  return request<Character>(
    `${API_BASE}/api/projects/${projectId}/characters`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function updateCharacter(
  projectId: string,
  characterId: string,
  payload: Partial<CharacterDraft>,
): Promise<Character> {
  return request<Character>(
    `${API_BASE}/api/projects/${projectId}/characters/${characterId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}
