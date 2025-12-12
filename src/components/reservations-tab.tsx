"use client"

import { useState } from "react"
import { Plus, Trash2, UserCheck, Clock, RotateCcw, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hardware, Participant, Reservation } from "@/lib/types"

interface ReservationsTabProps {
  hardware: Hardware[]
  setHardware: (hardware: Hardware[] | ((prev: Hardware[]) => Hardware[])) => void
  participants: Participant[]
  reservations: Reservation[]
  setReservations: (reservations: Reservation[] | ((prev: Reservation[]) => Reservation[])) => void
}

export function ReservationsTab({
  hardware,
  setHardware,
  participants,
  reservations,
  setReservations,
}: ReservationsTabProps) {
  const [selectedHardware, setSelectedHardware] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState("")
  const [reserveQuantity, setReserveQuantity] = useState("1")
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null)
  const [editReservationForm, setEditReservationForm] = useState({ quantity: "" })

  const createReservation = () => {
    if (!selectedHardware || !selectedParticipant || !reserveQuantity) return
    const hw = hardware.find((h) => h.id === selectedHardware)
    const qty = Number.parseInt(reserveQuantity)
    if (!hw || qty > hw.available) return

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      hardwareId: selectedHardware,
      participantId: selectedParticipant,
      quantity: qty,
      status: "approved",
      created_at: new Date().toISOString(),
    }

    setReservations((prev) => [...prev, reservation])
    setHardware((prev) => prev.map((h) => (h.id === selectedHardware ? { ...h, available: h.available - qty } : h)))
    setSelectedHardware("")
    setSelectedParticipant("")
    setReserveQuantity("1")
  }

  const returnHardware = (reservationId: string) => {
    const reservation = reservations.find((r) => r.id === reservationId)
    if (!reservation) return

    setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status: "returned" as const } : r)))
    setHardware((prev) =>
      prev.map((h) => (h.id === reservation.hardwareId ? { ...h, available: h.available + reservation.quantity } : h)),
    )
  }

  const deleteReservation = (id: string) => {
    const reservation = reservations.find((r) => r.id === id)
    if (!reservation) return

    if (reservation.status !== "returned") {
      setHardware((prev) =>
        prev.map((h) =>
          h.id === reservation.hardwareId ? { ...h, available: h.available + reservation.quantity } : h,
        ),
      )
    }
    setReservations((prev) => prev.filter((r) => r.id !== id))
  }

  const startEditReservation = (res: Reservation) => {
    setEditingReservationId(res.id)
    setEditReservationForm({ quantity: res.quantity.toString() })
  }

  const saveEditReservation = (id: string) => {
    const reservation = reservations.find((r) => r.id === id)
    if (!reservation || !editReservationForm.quantity) return

    const newQty = Number.parseInt(editReservationForm.quantity)
    const oldQty = reservation.quantity
    const hw = hardware.find((h) => h.id === reservation.hardwareId)

    if (!hw) return

    const availableForEdit = hw.available + (reservation.status !== "returned" ? oldQty : 0)
    if (newQty > availableForEdit) return

    if (reservation.status !== "returned") {
      setHardware((prev) =>
        prev.map((h) => (h.id === reservation.hardwareId ? { ...h, available: h.available + oldQty - newQty } : h)),
      )
    }

    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, quantity: newQty } : r)))
    setEditingReservationId(null)
  }

  const cancelEditReservation = () => {
    setEditingReservationId(null)
  }

  const getParticipantName = (id: string) => participants.find((p) => p.id === id)?.name || "Unknown"

  const getHardwareName = (id: string) => hardware.find((h) => h.id === id)?.name || "Unknown"

  return (
    <div className="space-y-6">
      {/* Create Reservation */}
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
                  .filter((h) => h.available > 0)
                  .map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} ({h.available} available)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Quantity"
              min="1"
              max={hardware.find((h) => h.id === selectedHardware)?.available || 1}
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

      {/* Reservations List */}
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
                      <p className="font-medium">{getParticipantName(res.participantId)}</p>
                      {editingReservationId === res.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{getHardwareName(res.hardwareId)} ×</span>
                          <Input
                            type="number"
                            value={editReservationForm.quantity}
                            onChange={(e) => setEditReservationForm({ quantity: e.target.value })}
                            className="h-6 w-16 text-sm"
                            min="1"
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
                          {getHardwareName(res.hardwareId)} × {res.quantity}
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
                          <Button variant="outline" size="sm" onClick={() => returnHardware(res.id)}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Return
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
