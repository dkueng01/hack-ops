"use client"

import { useState } from "react"
import { Plus, Trash2, Users, Edit2, Check, X, UserCheck, UserX, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Participant, Team } from "@/lib/types"

interface ParticipantsTabProps {
  participants: Participant[]
  setParticipants: (participants: Participant[] | ((prev: Participant[]) => Participant[])) => void
  teams: Team[]
  setTeams: (teams: Team[] | ((prev: Team[]) => Team[])) => void
}

const TEAM_COLORS = [
  { name: "Red", value: "bg-red-500/20 text-red-400 border-red-500/30" },
  { name: "Blue", value: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { name: "Green", value: "bg-green-500/20 text-green-400 border-green-500/30" },
  { name: "Yellow", value: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { name: "Purple", value: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { name: "Pink", value: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { name: "Orange", value: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { name: "Cyan", value: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
]

const SUGGESTED_SKILLS = [
  "Frontend",
  "Backend",
  "Design",
  "Mobile",
  "AI/ML",
  "DevOps",
  "Data Science",
  "Hardware",
  "Project Management",
  "Marketing",
]

export function ParticipantsTab({ participants, setParticipants, teams, setTeams }: ParticipantsTabProps) {
  // Participant form state
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [participantSkills, setParticipantSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")

  // Team form state
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0].value)

  // Edit states
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null)
  const [editParticipantForm, setEditParticipantForm] = useState({
    name: "",
    email: "",
    skills: [] as string[],
    teamId: null as string | null,
  })
  const [editSkillInput, setEditSkillInput] = useState("")

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editTeamForm, setEditTeamForm] = useState({
    name: "",
    description: "",
    color: "",
  })

  // Filter state
  const [filterSkill, setFilterSkill] = useState<string | null>(null)
  const [filterCheckedIn, setFilterCheckedIn] = useState<boolean | null>(null)

  // Add participant
  const addParticipant = () => {
    if (!participantName.trim()) return
    const participant: Participant = {
      id: crypto.randomUUID(),
      name: participantName,
      email: participantEmail,
      skills: participantSkills,
      checkedIn: false,
      teamId: null,
      createdAt: new Date().toISOString(),
    }
    setParticipants((prev) => [...prev, participant])
    setParticipantName("")
    setParticipantEmail("")
    setParticipantSkills([])
  }

  // Add skill to new participant form
  const addSkill = () => {
    if (!skillInput.trim() || participantSkills.includes(skillInput.trim())) return
    setParticipantSkills((prev) => [...prev, skillInput.trim()])
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    setParticipantSkills((prev) => prev.filter((s) => s !== skill))
  }

  // Add team
  const addTeam = () => {
    if (!teamName.trim()) return
    const team: Team = {
      id: crypto.randomUUID(),
      name: teamName,
      description: teamDescription,
      color: teamColor,
      createdAt: new Date().toISOString(),
    }
    setTeams((prev) => [...prev, team])
    setTeamName("")
    setTeamDescription("")
    setTeamColor(TEAM_COLORS[0].value)
  }

  // Delete team
  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id))
    // Remove team assignment from participants
    setParticipants((prev) => prev.map((p) => (p.teamId === id ? { ...p, teamId: null } : p)))
  }

  // Toggle check-in
  const toggleCheckIn = (id: string) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, checkedIn: !p.checkedIn } : p)))
  }

  // Assign team
  const assignTeam = (participantId: string, teamId: string | null) => {
    setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, teamId } : p)))
  }

  // Delete participant
  const deleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  // Edit participant
  const startEditParticipant = (p: Participant) => {
    setEditingParticipantId(p.id)
    setEditParticipantForm({
      name: p.name,
      email: p.email || "",
      skills: [...(p.skills || [])],
      teamId: p.teamId ?? null,
    })
  }

  const saveEditParticipant = (id: string) => {
    if (!editParticipantForm.name.trim()) return
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: editParticipantForm.name,
              email: editParticipantForm.email,
              skills: editParticipantForm.skills,
              teamId: editParticipantForm.teamId,
            }
          : p,
      ),
    )
    setEditingParticipantId(null)
  }

  const addEditSkill = () => {
    if (!editSkillInput.trim() || editParticipantForm.skills.includes(editSkillInput.trim())) return
    setEditParticipantForm((prev) => ({
      ...prev,
      skills: [...prev.skills, editSkillInput.trim()],
    }))
    setEditSkillInput("")
  }

  const removeEditSkill = (skill: string) => {
    setEditParticipantForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  // Edit team
  const startEditTeam = (t: Team) => {
    setEditingTeamId(t.id)
    setEditTeamForm({
      name: t.name,
      description: t.description,
      color: t.color,
    })
  }

  const saveEditTeam = (id: string) => {
    if (!editTeamForm.name.trim()) return
    setTeams((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name: editTeamForm.name,
              description: editTeamForm.description,
              color: editTeamForm.color,
            }
          : t,
      ),
    )
    setEditingTeamId(null)
  }

  // Get team by ID
  const getTeam = (id: string | null) => (id ? teams.find((t) => t.id === id) : undefined)
  const getTeamMembers = (teamId: string) => participants.filter((p) => p.teamId === teamId)

  const safeParticipants = participants.map((p) => ({
    ...p,
    skills: p.skills || [],
    checkedIn: p.checkedIn ?? false,
    teamId: p.teamId ?? null,
    email: p.email || "",
  }))

  const filteredParticipants = safeParticipants.filter((p) => {
    if (filterSkill && !p.skills.includes(filterSkill)) return false
    if (filterCheckedIn !== null && p.checkedIn !== filterCheckedIn) return false
    return true
  })

  const allSkills = Array.from(new Set(safeParticipants.flatMap((p) => p.skills))).sort()
  const checkedInCount = safeParticipants.filter((p) => p.checkedIn).length
  const unassignedCount = safeParticipants.filter((p) => !p.teamId).length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{checkedInCount}</div>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{unassignedCount}</div>
            <p className="text-xs text-muted-foreground">Unassigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            <Input
              placeholder="Description (optional)"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
            />
            <Select value={teamColor} onValueChange={setTeamColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_COLORS.map((color) => (
                  <SelectItem key={color.name} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.value.split(" ")[0]}`} />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addTeam} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </div>

          {teams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {teams.map((team) => (
                <div key={team.id} className={`p-4 rounded-lg border ${team.color}`}>
                  {editingTeamId === team.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editTeamForm.name}
                        onChange={(e) =>
                          setEditTeamForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Team name"
                      />
                      <Input
                        value={editTeamForm.description}
                        onChange={(e) =>
                          setEditTeamForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Description"
                      />
                      <Select
                        value={editTeamForm.color}
                        onValueChange={(v) => setEditTeamForm((prev) => ({ ...prev, color: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEAM_COLORS.map((color) => (
                            <SelectItem key={color.name} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color.value.split(" ")[0]}`} />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEditTeam(team.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingTeamId(null)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          {team.description && <p className="text-sm opacity-80">{team.description}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditTeam(team)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteTeam(team.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs opacity-70 mb-1">{getTeamMembers(team.id).length} members</p>
                        <div className="flex flex-wrap gap-1">
                          {getTeamMembers(team.id).map((member) => (
                            <Badge key={member.id} variant="outline" className="text-xs">
                              {member.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Participant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Participant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Participant name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email (optional)"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Add skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button variant="outline" onClick={addSkill} type="button">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Suggested Skills */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SKILLS.filter((s) => !participantSkills.includes(s)).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => setParticipantSkills((prev) => [...prev, skill])}
              >
                + {skill}
              </Badge>
            ))}
          </div>

          {/* Selected Skills */}
          {participantSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {participantSkills.map((skill) => (
                <Badge key={skill} className="cursor-pointer" onClick={() => removeSkill(skill)}>
                  {skill} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <Button onClick={addParticipant} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Participants</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={filterSkill || "all"} onValueChange={(v) => setFilterSkill(v === "all" ? null : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterCheckedIn === null ? "all" : filterCheckedIn.toString()}
                onValueChange={(v) => setFilterCheckedIn(v === "all" ? null : v === "true")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Check-in status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Checked In</SelectItem>
                  <SelectItem value="false">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {participants.length === 0
                ? "No participants yet. Add your first participant above!"
                : "No participants match the current filters."}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredParticipants
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                    {editingParticipantId === p.id ? (
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            value={editParticipantForm.name}
                            onChange={(e) =>
                              setEditParticipantForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Name"
                          />
                          <Input
                            value={editParticipantForm.email}
                            onChange={(e) =>
                              setEditParticipantForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Email"
                          />
                          <Select
                            value={editParticipantForm.teamId || "none"}
                            onValueChange={(v) =>
                              setEditParticipantForm((prev) => ({
                                ...prev,
                                teamId: v === "none" ? null : v,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Assign team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Team</SelectItem>
                              {teams.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={editSkillInput}
                            onChange={(e) => setEditSkillInput(e.target.value)}
                            placeholder="Add skill"
                            className="max-w-[200px]"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEditSkill())}
                          />
                          <Button variant="outline" size="sm" onClick={addEditSkill}>
                            <Tag className="h-3 w-3" />
                          </Button>
                          <div className="flex flex-wrap gap-1">
                            {editParticipantForm.skills.map((skill) => (
                              <Badge key={skill} className="cursor-pointer" onClick={() => removeEditSkill(skill)}>
                                {skill} <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEditParticipant(p.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingParticipantId(null)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant={p.checkedIn ? "default" : "outline"}
                          size="icon"
                          className="shrink-0"
                          onClick={() => toggleCheckIn(p.id)}
                        >
                          {p.checkedIn ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{p.name}</p>
                            {p.email && <span className="text-xs text-muted-foreground">({p.email})</span>}
                            {p.teamId && getTeam(p.teamId) && (
                              <Badge className={`${getTeam(p.teamId)?.color} border`}>{getTeam(p.teamId)?.name}</Badge>
                            )}
                          </div>
                          {p.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Select
                          value={p.teamId || "none"}
                          onValueChange={(v) => assignTeam(p.id, v === "none" ? null : v)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Assign team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Team</SelectItem>
                            {teams.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditParticipant(p)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteParticipant(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
