// useTasks — fetch, create, update status, realtime sync (US3, US4, US5).
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type Task = {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "HIGH" | "MED" | "LOW";
  story_points: number | null;
  due_date: string | null;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
};

export function useTasks(projectId?: string): { data: Task[]; loading: boolean; error: string | null; reload: () => void; create: (input: Partial<Task> & { title: string; status: Task["status"] }) => Promise<Task | null>; update: (id: string, input: Partial<Pick<Task, "sprint_id" | "title" | "description" | "priority" | "story_points" | "assignee_id" | "due_date">>) => Promise<boolean>; updateStatus: (id: string, status: Task["status"]) => Promise<void>; remove: (id: string) => Promise<void>; } {
  const { user } = useAuth();
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (err) setError(err.message);
    else setData((rows as Task[]) ?? []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // realtime disabled - causing white screen issues
  // useEffect(() => {
  //   if (!projectId) return;
  //   
  //   const channel = supabase.channel(`tasks-${projectId}`);
  //   
  //   channel.on(
  //     "postgres_changes",
  //     { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
  //     () => {
  //       load();
  //     }
  //   );
  //   
  //   channel.subscribe();
  //   
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [projectId, load]);

  const create = async (input: Partial<Task> & { title: string; status: Task["status"] }) => {
    if (!user || !projectId) return;
    const { data: row, error: err } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority ?? "MED",
        story_points: input.story_points ?? 0,
        assignee_id: input.assignee_id ?? null,
        due_date: input.due_date ?? null,
        sort_order: data.length,
        created_by: user.id,
      })
      .select()
      .single();
    if (err) {
      toast.error(err.message);
      return null;
    }
    toast.success("Task created");
    setData((d) => [...d, row as Task]);
    return row as Task;
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    // optimistic
    setData((d) => d.map((t) => (t.id === id ? { ...t, status } : t)));
    const { error: err } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (err) {
      toast.error(err.message);
      load();
    }
  };

  const update = async (id: string, input: Partial<Pick<Task, "sprint_id" | "title" | "description" | "priority" | "story_points" | "assignee_id" | "due_date">>) => {
    const { error: err } = await supabase.from("tasks").update(input).eq("id", id);
    if (err) {
      toast.error(err.message);
      return false;
    }
    setData((d) => d.map((t) => (t.id === id ? { ...t, ...input } : t)));
    return true;
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from("tasks").delete().eq("id", id);
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Task deleted");
    setData((d) => d.filter((t) => t.id !== id));
  };

  return { data, loading, error, reload: load, create, update, updateStatus, remove };
}

// US4 — tasks assigned to me, across all projects
export function useMyTasks() {
  const { user } = useAuth();
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from("tasks")
      .select("*")
      .eq("assignee_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false });
    setData((rows as Task[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [user, load]);

  // realtime disabled - causing white screen issues
  // useEffect(() => {
  //   if (!user) return;
  //   
  //   const channel = supabase.channel(`my-tasks-${user.id}`);
  //   
  //   channel.on(
  //     "postgres_changes",
  //     { event: "*", schema: "public", table: "tasks" },
  //     () => {
  //       load();
  //     }
  //   );
  //   
  //   channel.subscribe();
  //   
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [user, load]);

  return { data, loading, reload: load };
}
