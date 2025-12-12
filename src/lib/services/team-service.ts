import { getApiClient } from "@/lib/api-client";
import type { Team, Participant } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";

export const TeamService = {
  async getTeams(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("teams")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return data as Team[];
  },

  async createTeam(user: CurrentUser, team: Omit<Team, "id" | "created_at">) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("teams")
      .insert({ ...team, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    return data as Team
  },

  async updateTeam(user: CurrentUser, id: string, updates: Partial<Team>) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("teams")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as Team
  },

  async deleteTeam(user: CurrentUser, id: string) {
    const pg = await getApiClient(user)
    const { error } = await pg.from("teams").delete().eq("id", id)
    if (error) throw error
  },

  async getParticipants(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("participants")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return data as Participant[];
  },

  async createParticipant(user: CurrentUser, participant: Omit<Participant, "id" | "created_at">) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("participants")
      .insert({ ...participant, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    return data as Participant
  },

  async updateParticipant(user: CurrentUser, id: string, updates: Partial<Participant>) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("participants")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as Participant
  },

  async deleteParticipant(user: CurrentUser, id: string) {
    const pg = await getApiClient(user)
    const { error } = await pg.from("participants").delete().eq("id", id)
    if (error) throw error
  },

  async assignTeam(
    user: CurrentUser,
    participantId: string,
    teamId: string | null
  ) {
    const pg = await getApiClient(user)
    const { data, error } = await pg
      .from("participants")
      .update({ team_id: teamId })
      .eq("id", participantId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data as Participant
  }
};