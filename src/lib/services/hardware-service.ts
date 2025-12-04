import { getApiClient } from "@/lib/api-client";
import type { Hardware } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";

export const HardwareService = {
  async getAll(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("hardware")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Hardware[];
  },

  async create(user: CurrentUser, item: Omit<Hardware, "id" | "createdAt">) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("hardware")
      .insert({ ...item, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Hardware;
  },

  async update(user: CurrentUser, id: string, updates: Partial<Omit<Hardware, "id" | "createdAt" | "user_id">>) {
    const pg = await getApiClient(user);

    const { data, error } = await pg
      .from("hardware")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Hardware;
  },

  async delete(user: CurrentUser, id: string) {
    const pg = await getApiClient(user);
    const { error } = await pg
      .from("hardware")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
  }
};