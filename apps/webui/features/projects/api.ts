export interface Project {
  id: number;
  name: string;
  archived: number;
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) throw new Error("projects load failed");
  return (await res.json()) as Project[];
}

export async function createProject(name: string): Promise<number> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("project create failed");
  return ((await res.json()) as { id: number }).id;
}

export async function renameProject(id: number, name: string): Promise<void> {
  await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
}

export async function archiveProject(id: number): Promise<void> {
  await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, archived: true }),
  });
}
