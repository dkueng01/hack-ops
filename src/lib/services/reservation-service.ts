import { getApiClient } from "@/lib/api-client";
import type { Reservation } from "@/lib/types";
import { CurrentUser } from "@stackframe/stack";

export const ReservationService = {
  async getAll(user: CurrentUser) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("reservations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Reservation[];
  },

  async create(user: CurrentUser, reservation: Omit<Reservation, "id" | "createdAt">) {
    const pg = await getApiClient(user);
    const { data, error } = await pg
      .from("reservations")
      .insert({ ...reservation, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Reservation;
  },

  async updateStatus(user: CurrentUser, id: string, status: "approved" | "returned") {
    const pg = await getApiClient(user);
    const { error } = await pg
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  }
};