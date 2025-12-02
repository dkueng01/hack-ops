"use client"

import { useState } from "react"
import { Plus, Trash2, Package, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { Hardware } from "@/lib/types"

interface HardwareTabProps {
  hardware: Hardware[]
  setHardware: (hardware: Hardware[] | ((prev: Hardware[]) => Hardware[])) => void
}

export function HardwareTab({ hardware, setHardware }: HardwareTabProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", quantity: "" })

  const addHardware = () => {
    if (!name.trim() || !quantity) return
    const item: Hardware = {
      id: crypto.randomUUID(),
      name,
      description,
      quantity: Number.parseInt(quantity),
      available: Number.parseInt(quantity),
      createdAt: new Date().toISOString(),
    }
    setHardware((prev) => [...prev, item])
    setName("")
    setDescription("")
    setQuantity("")
  }

  const deleteHardware = (id: string) => {
    setHardware((prev) => prev.filter((item) => item.id !== id))
  }

  const startEdit = (item: Hardware) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      description: item.description,
      quantity: item.quantity.toString(),
    })
  }

  const saveEdit = (id: string) => {
    setHardware((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: editForm.name,
              description: editForm.description,
              quantity: Number.parseInt(editForm.quantity),
              available: item.available + (Number.parseInt(editForm.quantity) - item.quantity),
            }
          : item,
      ),
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const totalItems = hardware.reduce((sum, h) => sum + h.quantity, 0)
  const totalAvailable = hardware.reduce((sum, h) => sum + h.available, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hardware</p>
                <p className="text-2xl font-bold">{totalItems} items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/20">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-success">{totalAvailable} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Hardware</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Hardware name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button onClick={addHardware} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hardware Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {hardware.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hardware added yet. Add your first item!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hardware.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border bg-secondary/30 space-y-3">
                  {editingId === item.id ? (
                    <>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Name"
                      />
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={2}
                      />
                      <Input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Quantity"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(item.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHardware(item.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Total: {item.quantity}</Badge>
                        <Badge variant={item.available > 0 ? "default" : "destructive"}>
                          Available: {item.available}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
