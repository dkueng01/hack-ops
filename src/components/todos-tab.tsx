"use client"

import { useState } from "react"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  MessageSquarePlus,
  Edit2,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Todo, Decision } from "@/lib/types"

interface TodosTabProps {
  todos: Todo[]
  setTodos: (todos: Todo[] | ((prev: Todo[]) => Todo[])) => void
}

export function TodosTab({ todos, setTodos }: TodosTabProps) {
  const [newTodo, setNewTodo] = useState("")
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())
  const [newDecisions, setNewDecisions] = useState<Record<string, string>>({})
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editingTodoTitle, setEditingTodoTitle] = useState("")
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null)
  const [editingDecisionText, setEditingDecisionText] = useState("")

  const addTodo = () => {
    if (!newTodo.trim()) return
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: newTodo,
      completed: false,
      decisions: [],
      createdAt: new Date().toISOString(),
    }
    setTodos((prev) => [...prev, todo])
    setNewTodo("")
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleExpand = (id: string) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const addDecision = (todoId: string) => {
    const text = newDecisions[todoId]?.trim()
    if (!text) return
    const decision: Decision = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    }
    setTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, decisions: [...todo.decisions, decision] } : todo)),
    )
    setNewDecisions((prev) => ({ ...prev, [todoId]: "" }))
  }

  const deleteDecision = (todoId: string, decisionId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, decisions: todo.decisions.filter((d) => d.id !== decisionId) } : todo,
      ),
    )
  }

  const startEditTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditingTodoTitle(todo.title)
  }

  const saveEditTodo = (id: string) => {
    if (!editingTodoTitle.trim()) return
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, title: editingTodoTitle } : todo)))
    setEditingTodoId(null)
  }

  const cancelEditTodo = () => {
    setEditingTodoId(null)
  }

  const startEditDecision = (decision: Decision) => {
    setEditingDecisionId(decision.id)
    setEditingDecisionText(decision.text)
  }

  const saveEditDecision = (todoId: string, decisionId: string) => {
    if (!editingDecisionText.trim()) return
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              decisions: todo.decisions.map((d) => (d.id === decisionId ? { ...d, text: editingDecisionText } : d)),
            }
          : todo,
      ),
    )
    setEditingDecisionId(null)
  }

  const cancelEditDecision = () => {
    setEditingDecisionId(null)
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hackathon Todos</span>
            <Badge variant="secondary" className="text-sm">
              {completedCount}/{todos.length} completed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="flex-1"
            />
            <Button onClick={addTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No todos yet. Add your first task!</p>
            ) : (
              todos.map((todo) => (
                <div key={todo.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30">
                    <button
                      onClick={() => toggleExpand(todo.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedTodos.has(todo.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    {editingTodoId === todo.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingTodoTitle}
                          onChange={(e) => setEditingTodoTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditTodo(todo.id)
                            if (e.key === "Escape") cancelEditTodo()
                          }}
                          className="flex-1 h-8"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => saveEditTodo(todo.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEditTodo}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </span>
                    )}
                    {todo.decisions.length > 0 && editingTodoId !== todo.id && (
                      <Badge variant="outline" className="text-xs">
                        {todo.decisions.length} decision{todo.decisions.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {editingTodoId !== todo.id && (
                      <Button variant="ghost" size="icon" onClick={() => startEditTodo(todo)} className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {expandedTodos.has(todo.id) && (
                    <div className="p-3 border-t bg-card space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add decision or result..."
                          value={newDecisions[todo.id] || ""}
                          onChange={(e) =>
                            setNewDecisions((prev) => ({
                              ...prev,
                              [todo.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && addDecision(todo.id)}
                          className="flex-1"
                        />
                        <Button variant="secondary" onClick={() => addDecision(todo.id)}>
                          <MessageSquarePlus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>

                      {todo.decisions.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                          {todo.decisions.map((decision) => (
                            <div key={decision.id} className="flex items-start gap-2 text-sm">
                              {editingDecisionId === decision.id ? (
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    value={editingDecisionText}
                                    onChange={(e) => setEditingDecisionText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEditDecision(todo.id, decision.id)
                                      if (e.key === "Escape") cancelEditDecision()
                                    }}
                                    className="flex-1 h-7 text-sm"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => saveEditDecision(todo.id, decision.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={cancelEditDecision}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="flex-1 text-muted-foreground">{decision.text}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(decision.createdAt).toLocaleDateString()}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => startEditDecision(decision)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => deleteDecision(todo.id, decision.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
