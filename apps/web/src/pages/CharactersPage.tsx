import { FormEvent, useEffect, useState } from "react";
import {
  createCharacter,
  listCharacters,
  updateCharacter,
  type Character,
  type CharacterDraft,
} from "../api/characters";
import { useProject } from "../app/ProjectContext";

const emptyDraft: CharacterDraft = {
  name: "",
  role: "",
  age: "",
  personality: "",
  appearance: "",
  hair: "",
  eyes: "",
  skin: "",
  body: "",
  clothing: "",
  colors: "",
  visual_style: "",
  voice: "",
  relationships: "",
  character_arc: "",
  facts: "",
};

const sections = [
  {
    eyebrow: "IDENTITY",
    title: "Core identity",
    fields: [
      ["name", "Name", "Ayla"],
      ["role", "Role", "Protagonist, mentor, antagonist..."],
      ["age", "Age", "22"],
      ["personality", "Personality", "Traits, temperament, behavior..."],
      ["appearance", "Appearance", "Overall physical identity..."],
    ],
  },
  {
    eyebrow: "VISUAL DNA",
    title: "Visual continuity",
    fields: [
      ["hair", "Hair", "Color, length, shape..."],
      ["eyes", "Eyes", "Color, shape, distinctive details..."],
      ["skin", "Skin", "Tone and visual notes..."],
      ["body", "Body", "Build, silhouette, proportions..."],
      ["clothing", "Clothing", "Signature outfit and accessories..."],
      ["colors", "Colors", "Signature palette..."],
      ["visual_style", "Visual style", "Cinematic 2.5D, illustration, etc..."],
    ],
  },
  {
    eyebrow: "STORY DNA",
    title: "Voice, relationships & arc",
    fields: [
      ["voice", "Voice", "Tone, pace, delivery..."],
      ["relationships", "Relationships", "Important connections..."],
      ["character_arc", "Character arc", "Transformation and emotional journey..."],
      ["facts", "Facts", "Immutable or continuity-critical facts..."],
    ],
  },
] as const;

export default function CharactersPage() {
  const { project } = useProject();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCharacters(projectId: string) {
    setLoading(true);
    setMessage("");

    try {
      setCharacters(await listCharacters(projectId));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load characters.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project) {
      void loadCharacters(project.id);
    }
  }, [project]);

  function selectCharacter(character: Character) {
    setEditingId(character.id);
    setDraft({
      name: character.name,
      role: character.role,
      age: character.age,
      personality: character.personality,
      appearance: character.appearance,
      hair: character.hair,
      eyes: character.eyes,
      skin: character.skin,
      body: character.body,
      clothing: character.clothing,
      colors: character.colors,
      visual_style: character.visual_style,
      voice: character.voice,
      relationships: character.relationships,
      character_arc: character.character_arc,
      facts: character.facts,
    });
    setMessage("");
  }

  function startNewCharacter() {
    setEditingId(null);
    setDraft(emptyDraft);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!project || !draft.name.trim()) {
      setMessage("Character name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const saved = editingId
        ? await updateCharacter(project.id, editingId, draft)
        : await createCharacter(project.id, draft);

      setCharacters((current) =>
        editingId
          ? current.map((character) =>
              character.id === saved.id ? saved : character,
            )
          : [saved, ...current],
      );
      setEditingId(saved.id);
      setMessage("Character DNA saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save character.",
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
          <p className="eyebrow">CHARACTER DNA</p>
          <h2>Characters</h2>
        </div>
        <span>{project.name}</span>
      </div>

      <div className="character-studio">
        <aside className="character-roster">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CAST</p>
              <h3>Project characters</h3>
            </div>
            <span>{characters.length}</span>
          </div>

          <button
            className="primary-button character-new-button"
            type="button"
            onClick={startNewCharacter}
          >
            + New Character
          </button>

          <div className="character-roster-list">
            {loading ? (
              <p className="character-empty">Loading character DNA...</p>
            ) : characters.length === 0 ? (
              <p className="character-empty">
                No characters yet. Build the first identity for this world.
              </p>
            ) : (
              characters.map((character) => (
                <button
                  className={`character-roster-item ${
                    editingId === character.id ? "is-active" : ""
                  }`}
                  type="button"
                  key={character.id}
                  onClick={() => selectCharacter(character)}
                >
                  <span className="character-avatar">
                    {character.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <strong>{character.name}</strong>
                    <small>{character.role || "Character"}</small>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <form className="character-dna-panel" onSubmit={handleSubmit}>
          <div className="character-dna-header">
            <div>
              <p className="eyebrow">
                {editingId ? "EDIT DNA" : "NEW DNA"}
              </p>
              <h3>
                {draft.name.trim() || "Define the character."}
              </h3>
              <p>
                This identity becomes reusable production memory for future
                scenes, shots and visual generation.
              </p>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={saving || loading}
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Character"}
            </button>
          </div>

          {message && <div className="project-error">{message}</div>}

          {sections.map((section) => (
            <section className="character-dna-section" key={section.title}>
              <div className="character-section-heading">
                <div>
                  <p className="eyebrow">{section.eyebrow}</p>
                  <h4>{section.title}</h4>
                </div>
              </div>

              <div className="character-dna-grid">
                {section.fields.map(([key, label, placeholder]) => (
                  <label
                    className={
                      key === "appearance" ||
                      key === "personality" ||
                      key === "character_arc" ||
                      key === "facts" ||
                      key === "relationships"
                        ? "character-field character-field-wide"
                        : "character-field"
                    }
                    key={key}
                  >
                    <span>{label}</span>
                    <textarea
                      rows={key === "name" || key === "role" || key === "age" ? 1 : 3}
                      value={draft[key]}
                      placeholder={placeholder}
                      disabled={saving}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </section>
          ))}
        </form>
      </div>
    </section>
  );
}
