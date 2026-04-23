// useProjects — list + create + delete projects (US1).
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: "active" | "archived";
  owner_id: string;
  created_at: string;
};

export function useProjects() {
  const { user } = useAuth();
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setData((rows as Project[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const create = async (input: { name: string; description?: string; color: string }) => {
    if (!user) return;
    const { data: row, error: err } = await supabase
      .from("projects")
      .insert({ ...input, owner_id: user.id })
      .select()
      .single();
    if (err) {
      toast.error(err.message);
      return null;
    }
    // owner is auto-member via is_project_member function, but insert into members for clarity
    await supabase.from("project_members").insert({ project_id: row.id, user_id: user.id });
    toast.success("Project created");
    setData((d) => [row as Project, ...d]);
    return row as Project;
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from("projects").delete().eq("id", id);
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Project deleted");
    setData((d) => d.filter((p) => p.id !== id));
  };

  return { data, loading, error, reload: load, create, remove };
}

export function useProject(id: string | undefined) {
  const [data, setData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data: row }) => {
        setData(row as Project | null);
        setLoading(false);
      });
  }, [id]);

  return { data, loading };
}
