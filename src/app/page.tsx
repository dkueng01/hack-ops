"use client"
import { useCallback, useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Zap, ListTodo, Wallet, Package, CalendarCheck, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TodosTab } from "@/components/todos-tab"
import { BudgetTab } from "@/components/budget-tab"
import { HardwareTab } from "@/components/hardware-tab"
import { ReservationsTab } from "@/components/reservations-tab"
import { ParticipantsTab } from "@/components/participants-tab"
import { useLocalStorage } from "@/lib/use-local-storage"
import type { Todo, BudgetEntry, Hardware, Participant, Reservation, Team } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { stackClientApp } from "@/stack/client"
import { HardwareService } from "@/lib/services/hardware-service"
import { TodoService } from "@/lib/services/todo-service"

export default function HackathonPlanner() {
  const user = stackClientApp.useUser({ or: 'redirect' })
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'todos'

  const [hardware, setHardware] = useState<Hardware[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      const [hardwareData, todoData] = await Promise.all([
        HardwareService.getAll(user),
        TodoService.getAll(user)
      ]);

      setHardware(hardwareData)
      setTodos(todoData)
      setIsLoading(false);
    }
    loadData();
  }, [user]);

  const migrateParticipants = useCallback((data: unknown): Participant[] => {
    if (!Array.isArray(data)) return []
    return data.map((p: Record<string, unknown>) => ({
      id: (p.id as string) || crypto.randomUUID(),
      name: (p.name as string) || "",
      email: (p.email as string) || "",
      skills: Array.isArray(p.skills) ? p.skills : [],
      checkedIn: typeof p.checkedIn === "boolean" ? p.checkedIn : false,
      teamId: (p.teamId as string | null) ?? null,
      created_at: (p.created_at as string) || new Date().toISOString(),
    }))
  }, [])

  const [budget, setBudget, budgetLoaded] = useLocalStorage<BudgetEntry[]>("hackathon-budget", [])
  const [participants, setParticipants, participantsLoaded] = useLocalStorage<Participant[]>(
    "hackathon-participants",
    [],
    migrateParticipants,
  )
  const [reservations, setReservations, reservationsLoaded] = useLocalStorage<Reservation[]>(
    "hackathon-reservations",
    [],
  )
  const [teams, setTeams, teamsLoaded] = useLocalStorage<Team[]>("hackathon-teams", [])

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">HackOps</h1>
                <p className="text-sm text-muted-foreground">Organize your hackathon with ease</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p>{user.displayName}</p>
              <Button variant="secondary" onClick={() => { stackClientApp.signOut() }}>Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="todos" className="gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Todos</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Participants</span>
            </TabsTrigger>
            <TabsTrigger value="hardware" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Hardware</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Reservations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <TodosTab todos={todos} setTodos={setTodos} user={user} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab budget={budget} setBudget={setBudget} />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantsTab
              participants={participants}
              setParticipants={setParticipants}
              teams={teams}
              setTeams={setTeams}
            />
          </TabsContent>

          <TabsContent value="hardware">
            <HardwareTab hardware={hardware} setHardware={setHardware} user={user} />
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationsTab
              hardware={hardware}
              setHardware={setHardware}
              participants={participants}
              reservations={reservations}
              setReservations={setReservations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
