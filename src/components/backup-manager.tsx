"use client"

import type React from "react"

import { useRef } from "react"
import { Download, Upload, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import type { Todo, BudgetEntry, Hardware, Participant, Reservation, Team } from "@/lib/types"

interface BackupData {
  version: string
  exportedAt: string
  data: {
    todos: Todo[]
    budget: BudgetEntry[]
    hardware: Hardware[]
    participants: Participant[]
    reservations: Reservation[]
    teams: Team[]
  }
}

interface BackupManagerProps {
  todos: Todo[]
  budget: BudgetEntry[]
  hardware: Hardware[]
  participants: Participant[]
  reservations: Reservation[]
  teams: Team[]
  setTodos: (todos: Todo[]) => void
  setBudget: (budget: BudgetEntry[]) => void
  setHardware: (hardware: Hardware[]) => void
  setParticipants: (participants: Participant[]) => void
  setReservations: (reservations: Reservation[]) => void
  setTeams: (teams: Team[]) => void
}

export function BackupManager({
  todos,
  budget,
  hardware,
  participants,
  reservations,
  teams,
  setTodos,
  setBudget,
  setHardware,
  setParticipants,
  setReservations,
  setTeams,
}: BackupManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    const backupData: BackupData = {
      version: "1.1", // Updated version for new schema
      exportedAt: new Date().toISOString(),
      data: {
        todos,
        budget,
        hardware,
        participants,
        reservations,
        teams,
      },
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hackathon-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as BackupData

        // Validate the backup structure
        if (!data.version || !data.data) {
          throw new Error("Invalid backup file format")
        }

        if (
          !Array.isArray(data.data.todos) ||
          !Array.isArray(data.data.budget) ||
          !Array.isArray(data.data.hardware) ||
          !Array.isArray(data.data.participants) ||
          !Array.isArray(data.data.reservations)
        ) {
          throw new Error("Invalid backup data structure")
        }

        if (!Array.isArray(data.data.teams)) {
          data.data.teams = []
        }

        data.data.participants = data.data.participants.map((p: any) => ({
          ...p,
          skills: p.skills || [],
          checkedIn: p.checkedIn ?? false,
          teamId: p.teamId ?? null,
        }))

        setImportError(null)
        setPendingImport(data)
        setShowConfirmDialog(true)
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Failed to parse backup file")
      }
    }
    reader.readAsText(file)

    // Reset the input so the same file can be selected again
    e.target.value = ""
  }

  const confirmImport = () => {
    if (!pendingImport) return

    setTodos(pendingImport.data.todos)
    setBudget(pendingImport.data.budget)
    setHardware(pendingImport.data.hardware)
    setParticipants(pendingImport.data.participants)
    setReservations(pendingImport.data.reservations)
    setTeams(pendingImport.data.teams)

    setPendingImport(null)
    setShowConfirmDialog(false)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Backup
        </Button>
        <Button variant="outline" size="sm" onClick={handleImportClick}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
      </div>

      {importError && (
        <Dialog open={!!importError} onOpenChange={() => setImportError(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Import Error
              </DialogTitle>
              <DialogDescription>{importError}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Backup Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all your current data with the imported backup from{" "}
              {pendingImport?.exportedAt ? new Date(pendingImport.exportedAt).toLocaleDateString() : "unknown date"}
              .
              <br />
              <br />
              <strong>This action cannot be undone.</strong> Consider exporting your current data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImport(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
