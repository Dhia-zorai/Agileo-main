// useMembers — list members + invite by email (US2).
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Member = {
   id: string;
   user_id: string;
   project_id: string;
   profile: {
     id: string;
     name: string;
     email: string;
     avatar_color: string;
   } | null;
 };

export type Profile = NonNullable<Member['profile']>;

interface ProjectMemberRow {
  id: string;
  user_id: string;
  project_id: string;
}

export function useMembers(projectId?: string): { data: Member[]; loading: boolean; invite: (email: string) => Promise<boolean>; remove: (memberId: string) => Promise<void>; reload: () => void; } {
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
     if (!projectId) return;
     setLoading(true);
     const { data: rows, error } = await supabase
       .from("project_members")
       .select("id, user_id, project_id")
       .eq("project_id", projectId);
     if (error) {
       toast.error(error.message);
       setLoading(false);
       return;
     }
     if (!rows) {
       setData([]);
       setLoading(false);
       return;
     }
     const ids = rows.map((r: ProjectMemberRow) => r.user_id);
     const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", ids);
     if (profilesError) {
       toast.error(profilesError.message);
       setLoading(false);
       return;
     }
     const byId: Record<string, Profile> = {};
     (profiles ?? []).forEach((p: Profile) => (byId[p.id] = p));
     setData(rows.map((r: ProjectMemberRow) => ({ ...r, profile: byId[r.user_id] ?? null })));
     setLoading(false);
   }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (email: string) => {
    if (!projectId) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (!profile) {
      toast.error("No user found with that email. They must sign up first.");
      return false;
    }
    const { error } = await supabase
      .from("project_members")
      .insert({ project_id: projectId, user_id: profile.id });
    if (error) {
      toast.error(error.code === "23505" ? "Already a member" : error.message);
      return false;
    }
    toast.success(`Invited ${profile.name}`);
    load();
    return true;
  };

  const remove = async (memberId: string) => {
    const { error } = await supabase.from("project_members").delete().eq("id", memberId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Member removed");
    load();
  };

  return { data, loading, invite, remove, reload: load };
}

export function useAllProfiles() {
  const [data, setData] = useState<Profile[]>([]);
  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .then(({ data: rows }) => setData((rows as Profile[]) ?? []));
  }, []);
  return data;
}
