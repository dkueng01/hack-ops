import { getApiClient } from "@/lib/api-client";
import type { Todo, Decision } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";

export const TodoService = {
  async getAll(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("todos")
      .select("*, decisions(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Todo[];
  },

  async create(user: CurrentUser, title: string) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("todos")
      .insert({ title, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Todo;
  },

  async toggle(user: CurrentUser, id: string, completed: boolean) {
    const pg = await getApiClient(user);
    const { error } = await pg
      .from("todos")
      .update({ completed })
      .eq("id", id);

    if (error) throw error;
  },

  async update(user: CurrentUser, id: string, title: string) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("todos")
      .update({ title })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Todo
  },

  async delete(user: CurrentUser, id: string) {
    const pg = await getApiClient(user);
    const { error } = await pg.from("todos").delete().eq("id", id);
    if (error) throw error;
  }
};