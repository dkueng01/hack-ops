export interface Todo {
  id: string
  title: string
  completed: boolean
  decisions: Decision[]
  created_at: string
}

export interface Decision {
  id: string
  text: string
  created_at: string
}

export interface BudgetEntry {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  created_at: string
}

export interface Hardware {
  id: string
  name: string
  description: string
  quantity: number
  available: number
  created_at: string
}

export interface Participant {
  id: string
  name: string
  email: string
  skills: string[]
  checkedIn: boolean
  teamId: string | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  description: string
  color: string
  created_at: string
}

export interface Reservation {
  id: string
  hardwareId: string
  participantId: string
  quantity: number
  status: "pending" | "approved" | "returned"
  created_at: string
}
