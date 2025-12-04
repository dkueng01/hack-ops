import { getApiClient } from "@/lib/api-client";
import type { BudgetEntry } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";

export const BudgetService = {
  async getAll(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("budget_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BudgetEntry[];
  },

  async create(user: CurrentUser, entry: Omit<BudgetEntry, "id" | "createdAt">) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("budget_entries")
      .insert({ ...entry, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetEntry;
  },

  async delete(user: CurrentUser, id: string) {
    const pg = await getApiClient(user);
    const { error } = await pg.from("budget_entries").delete().eq("id", id);
    if (error) throw error;
  }
};