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

  async getParticipants(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("participants")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return data as Participant[];
  },

  async createTeam(user: CurrentUser, team: Omit<Team, "id" | "createdAt">) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("teams")
      .insert({ ...team, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  }
};