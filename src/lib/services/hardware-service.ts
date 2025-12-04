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
  }
};