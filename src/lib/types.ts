export interface Todo {
  id: string
  title: string
  completed: boolean
  decisions: Decision[]
  createdAt: string
}

export interface Decision {
  id: string
  text: string
  createdAt: string
}

export interface BudgetEntry {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  createdAt: string
}

export interface Hardware {
  id: string
  name: string
  description: string
  quantity: number
  available: number
  createdAt: string
}

export interface Participant {
  id: string
  name: string
  email: string
  skills: string[]
  checkedIn: boolean
  teamId: string | null
  createdAt: string
}

export interface Team {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
}

export interface Reservation {
  id: string
  hardwareId: string
  participantId: string
  quantity: number
  status: "pending" | "approved" | "returned"
  createdAt: string
}
