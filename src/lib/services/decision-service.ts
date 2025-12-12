import { getApiClient } from "@/lib/api-client"
import type { Decision } from "@/lib/types"
import { CurrentUser } from "@stackframe/stack"

export const DecisionService = {
  async getAll(user: CurrentUser, todoId: string) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("decisions")
      .select("*")
      .eq("todo_id", todoId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Decision[]
  },

  async create(user: CurrentUser, todoId: string, text: string) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("decisions")
      .insert({
        text,
        todo_id: todoId,
      })
      .select()
      .single()

    if (error) throw error
    return data as Decision
  },

  async update(user: CurrentUser, id: string, text: string) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("decisions")
      .update({ text })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Decision
  },

  async delete(user: CurrentUser, id: string) {
    const pg = await getApiClient(user)
    const { error } = await pg.from("decisions").delete().eq("id", id)
    if (error) throw error
  },
}