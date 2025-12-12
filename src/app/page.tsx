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
import { BudgetService } from "@/lib/services/budget-service"
import { ReservationService } from "@/lib/services/reservation-service"
import { TeamService } from "@/lib/services/team-service"

export default function HackathonPlanner() {
  const user = stackClientApp.useUser({ or: 'redirect' })
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'todos'

  const [hardware, setHardware] = useState<Hardware[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [budget, setBudget] = useState<BudgetEntry[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      const [hardwareData, todoData, budgetData, reservationData, participantData, teamData] = await Promise.all([
        HardwareService.getAll(user),
        TodoService.getAll(user),
        BudgetService.getAll(user),
        ReservationService.getAll(user),
        TeamService.getParticipants(user),
        TeamService.getTeams(user)
      ]);

      setHardware(hardwareData)
      setTodos(todoData)
      setBudget(budgetData)
      setReservations(reservationData)
      setParticipants(participantData)
      setTeams(teamData)
      setIsLoading(false);
    }
    loadData();
  }, [user]);

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
            <BudgetTab budget={budget} setBudget={setBudget} user={user} />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantsTab
              participants={participants}
              setParticipants={setParticipants}
              teams={teams}
              setTeams={setTeams}
              user={user}
            />
          </TabsContent>

          <TabsContent value="hardware">
            <HardwareTab hardware={hardware} reservations={reservations} setHardware={setHardware} user={user} />
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationsTab
              hardware={hardware}
              setHardware={setHardware}
              participants={participants}
              reservations={reservations}
              setReservations={setReservations}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
