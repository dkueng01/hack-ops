"use client"

import { useState } from "react"
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BudgetEntry } from "@/lib/types"

interface BudgetTabProps {
  budget: BudgetEntry[]
  setBudget: (budget: BudgetEntry[] | ((prev: BudgetEntry[]) => BudgetEntry[])) => void
}

const categories = [
  "Sponsorship",
  "Registration",
  "Food & Drinks",
  "Venue",
  "Prizes",
  "Hardware",
  "Marketing",
  "Transportation",
  "Other",
]

export function BudgetTab({ budget, setBudget }: BudgetTabProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    type: "expense" as "income" | "expense",
    description: "",
    amount: "",
    category: "",
  })

  const addEntry = () => {
    if (!description.trim() || !amount || !category) return
    const entry: BudgetEntry = {
      id: crypto.randomUUID(),
      type,
      description,
      amount: Number.parseFloat(amount),
      category,
      createdAt: new Date().toISOString(),
    }
    setBudget((prev) => [...prev, entry])
    setDescription("")
    setAmount("")
    setCategory("")
  }

  const deleteEntry = (id: string) => {
    setBudget((prev) => prev.filter((entry) => entry.id !== id))
  }

  const startEdit = (entry: BudgetEntry) => {
    setEditingId(entry.id)
    setEditForm({
      type: entry.type,
      description: entry.description,
      amount: entry.amount.toString(),
      category: entry.category,
    })
  }

  const saveEdit = (id: string) => {
    if (!editForm.description.trim() || !editForm.amount || !editForm.category) return
    setBudget((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              type: editForm.type,
              description: editForm.description,
              amount: Number.parseFloat(editForm.amount),
              category: editForm.category,
            }
          : entry,
      ),
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const totalIncome = budget.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)

  const totalExpenses = budget.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)

  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/20">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                  ${balance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Budget / Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={addEntry} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {budget.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions yet. Add your first budget or expense!
            </p>
          ) : (
            <div className="space-y-2">
              {budget
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                    {editingId === entry.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <Select
                          value={editForm.type}
                          onValueChange={(v) => setEditForm((prev) => ({ ...prev, type: v as "income" | "expense" }))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="h-9"
                        />
                        <Input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                          className="h-9"
                        />
                        <Select
                          value={editForm.category}
                          onValueChange={(v) => setEditForm((prev) => ({ ...prev, category: v }))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => saveEdit(entry.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`p-2 rounded-lg ${entry.type === "income" ? "bg-success/20" : "bg-destructive/20"}`}
                        >
                          {entry.type === "income" ? (
                            <TrendingUp className={`h-4 w-4 text-success`} />
                          ) : (
                            <TrendingDown className={`h-4 w-4 text-destructive`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{entry.category}</Badge>
                        <p className={`font-bold ${entry.type === "income" ? "text-success" : "text-destructive"}`}>
                          {entry.type === "income" ? "+" : "-"}${entry.amount.toLocaleString()}
                        </p>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(entry)} className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
