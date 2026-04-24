// useSprints — list, create, update, delete sprints.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Sprint = {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  capacity: number;
  status: "planned" | "active" | "completed";
  created_at: string;
};

export function useSprints(projectId?: string) {
  const [data, setData] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("sprints")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setData((rows as Sprint[]) ?? []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (input: { name: string; goal?: string; start_date?: string; end_date?: string; capacity?: number }) => {
    if (!projectId) return null;
    const { data: row, error } = await supabase
      .from("sprints")
      .insert({
        project_id: projectId,
        name: input.name,
        goal: input.goal ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        capacity: input.capacity ?? 0,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return null;
    }
    toast.success("Sprint created");
    setData((d) => [row as Sprint, ...d]);
    return row as Sprint;
  };

  const update = async (id: string, input: Partial<Pick<Sprint, "name" | "goal" | "start_date" | "end_date" | "capacity" | "status">>) => {
    const { error } = await supabase.from("sprints").update(input).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sprint updated");
    setData((d) => d.map((s) => (s.id === id ? { ...s, ...input } : s)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("sprints").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sprint deleted");
    setData((d) => d.filter((s) => s.id !== id));
  };

  return { data, loading, reload: load, create, update, remove };
}

export function useProjectSprint(projectId?: string) {
  const [data, setData] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    supabase
      .from("sprints")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data: row }) => {
        setData(row as Sprint | null);
        setLoading(false);
      });
  }, [projectId]);

  return { data, loading };
}