"use client"

import { useState } from "react"
import { Plus, Trash2, UserCheck, Clock, RotateCcw, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hardware, Participant, Reservation } from "@/lib/types"
import { CurrentUser } from "@stackframe/stack"
import { ReservationService } from "@/lib/services/reservation-service"

interface ReservationsTabProps {
  hardware: Hardware[]
  setHardware: (hardware: Hardware[] | ((prev: Hardware[]) => Hardware[])) => void
  participants: Participant[]
  reservations: Reservation[]
  setReservations: (reservations: Reservation[] | ((prev: Reservation[]) => Reservation[])) => void
  user: CurrentUser
}

export function ReservationsTab({
  hardware,
  setHardware,
  participants,
  reservations,
  setReservations,
  user,
}: ReservationsTabProps) {
  const [selectedHardware, setSelectedHardware] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState("")
  const [reserveQuantity, setReserveQuantity] = useState("1")
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null)
  const [editReservationForm, setEditReservationForm] = useState({ quantity: "" })

  const createReservation = async () => {
    if (!selectedHardware || !selectedParticipant || !reserveQuantity) return
    const hw = hardware.find((h) => h.id === selectedHardware)
    const qty = Number.parseInt(reserveQuantity)
    if (!hw || qty > getAvailableUnits(hw.id)) return

    try {
      const newReservation = await ReservationService.create(user, {
        hardware_id: selectedHardware,
        participant_id: selectedParticipant,
        quantity: qty,
        status: "approved",
      })
      setReservations((prev) => [newReservation, ...prev])
      setHardware((prev) =>
        prev.map((h) =>
          h.id === selectedHardware ? { ...h, available: getAvailableUnits(h.id) - qty } : h,
        ),
      )
      setSelectedHardware("")
      setSelectedParticipant("")
      setReserveQuantity("1")
    } catch (error) {
      console.error("Failed to create reservation:", error)
    }
  }

  const returnHardware = async (reservationId: string) => {
    const reservation = reservations.find((r) => r.id === reservationId)
    if (!reservation) return

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: "returned" as const } : r,
      ),
    )
    setHardware((prev) =>
      prev.map((h) =>
        h.id === reservation.hardware_id
          ? { ...h, available: getAvailableUnits(h.id) + reservation.quantity }
          : h,
      ),
    )

    try {
      await ReservationService.updateStatus(user, reservationId, "returned")
    } catch (error) {
      console.error("Failed to return hardware:", error)
    }
  }

  const deleteReservation = async (id: string) => {
    const reservation = reservations.find((r) => r.id === id)
    if (!reservation) return
    const old = reservations

    if (reservation.status !== "returned") {
      setHardware((prev) =>
        prev.map((h) =>
          h.id === reservation.hardware_id
            ? { ...h, available: getAvailableUnits(h.id) + reservation.quantity }
            : h,
        ),
      )
    }

    setReservations((prev) => prev.filter((r) => r.id !== id))
    try {
      await ReservationService.delete(user, id)
    } catch (error) {
      console.error("Failed to delete reservation:", error)
      setReservations(old)
    }
  }

  const startEditReservation = (res: Reservation) => {
    setEditingReservationId(res.id)
    setEditReservationForm({ quantity: res.quantity.toString() })
  }

  const saveEditReservation = async (id: string) => {
    const reservation = reservations.find((r) => r.id === id)
    if (!reservation || !editReservationForm.quantity) return

    const newQty = Number.parseInt(editReservationForm.quantity)
    const oldQty = reservation.quantity
    const hw = hardware.find((h) => h.id === reservation.hardware_id)
    if (!hw) return

    const availableForEdit = getAvailableUnits(hw.id) + (reservation.status !== "returned" ? oldQty : 0)
    if (newQty > availableForEdit) return

    if (reservation.status !== "returned") {
      setHardware((prev) =>
        prev.map((h) =>
          h.id === reservation.hardware_id
            ? { ...h, available: getAvailableUnits(h.id) + oldQty - newQty }
            : h,
        ),
      )
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, quantity: newQty } : r,
      ),
    )
    setEditingReservationId(null)

    try {
      await ReservationService.update(user, id, { quantity: newQty })
    } catch (error) {
      console.error("Failed to update reservation:", error)
    }
  }

  const cancelEditReservation = () => {
    setEditingReservationId(null)
  }

  const getAvailableUnits = (hardwareId: string) => {
    const hw = hardware.find((h) => h.id === hardwareId)
    if (!hw) return 0

    const reservedQty = reservations
      .filter((r) => r.hardware_id === hardwareId && r.status === "approved")
      .reduce((sum, r) => sum + r.quantity, 0)

    return Math.max(0, hw.quantity - reservedQty)
  }

  const getParticipantName = (id: string) => participants.find((p) => p.id === id)?.name || "Unknown"

  const getHardwareName = (id: string) => hardware.find((h) => h.id === id)?.name || "Unknown"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reserve Hardware</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
              <SelectTrigger>
                <SelectValue placeholder="Select participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedHardware} onValueChange={setSelectedHardware}>
              <SelectTrigger>
                <SelectValue placeholder="Select hardware" />
              </SelectTrigger>
              <SelectContent>
                {hardware
                  .filter((h) => getAvailableUnits(h.id) > 0)
                  .map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} ({getAvailableUnits(h.id)} available)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Quantity"
              min="1"
              max={getAvailableUnits(selectedHardware || "")}
              value={reserveQuantity}
              onChange={(e) => setReserveQuantity(e.target.value)}
            />

            <Button onClick={createReservation} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Reserve
            </Button>
          </div>

          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add participants in the Participants tab first to make reservations.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reservations yet. Select a participant and hardware to create a reservation!
            </p>
          ) : (
            <div className="space-y-2">
              {reservations
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((res) => (
                  <div key={res.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                    <div className={`p-2 rounded-lg ${res.status === "returned" ? "bg-muted" : "bg-primary/20"}`}>
                      {res.status === "returned" ? (
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      ) : res.status === "approved" ? (
                        <UserCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getParticipantName(res.participant_id)}</p>
                      {editingReservationId === res.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{getHardwareName(res.hardware_id)} ×</span>
                          <Input
                            type="number"
                            value={editReservationForm.quantity}
                            onChange={(e) => setEditReservationForm({ quantity: e.target.value })}
                            className="h-6 w-16 text-sm"
                            min="1"
                            max={getAvailableUnits(res.hardware_id) + res.quantity}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => saveEditReservation(res.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEditReservation}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {getHardwareName(res.hardware_id)} × {res.quantity}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        res.status === "returned" ? "secondary" : res.status === "approved" ? "default" : "outline"
                      }
                    >
                      {res.status}
                    </Badge>
                    <div className="flex gap-2">
                      {res.status !== "returned" && editingReservationId !== res.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEditReservation(res)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReservation(res.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
