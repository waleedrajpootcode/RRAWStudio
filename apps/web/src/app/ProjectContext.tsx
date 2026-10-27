import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProject, type Project } from "../api/projects";

type ProjectContextValue = {
  project: Project | null;
  loading: boolean;
  error: string;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

type ProjectProviderProps = {
  projectId: string;
  children: ReactNode;
};

export function ProjectProvider({
  projectId,
  children,
}: ProjectProviderProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setLoading(true);
      setError("");

      try {
        const result = await getProject(projectId);

        if (!cancelled) {
          setProject(result);
        }
      } catch (err) {
        if (!cancelled) {
          setProject(null);
          setError(
            err instanceof Error ? err.message : "Unable to load project.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const value = useMemo(
    () => ({
      project,
      loading,
      error,
    }),
    [project, loading, error],
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProject must be used inside ProjectProvider.");
  }

  return context;
}
