"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RefreshCw, Plus } from "lucide-react"

type NodeId = 1 | 2 | 3 | 4 | 5

interface LogEntry {
  term: number
  command: string
  color: string
}

interface Node {
  id: NodeId
  isLeader: boolean
  term: number
  log: LogEntry[]
  commitIndex: number
}

interface Message {
  id: string
  from: NodeId
  to: NodeId
  type: "appendEntries" | "appendEntriesResponse"
  success?: boolean
  entries?: LogEntry[]
  term: number
  leaderCommit?: number
}

const COLORS = [
  "bg-blue-200 dark:bg-blue-800",
  "bg-green-200 dark:bg-green-800",
  "bg-purple-200 dark:bg-purple-800",
  "bg-yellow-200 dark:bg-yellow-800",
  "bg-pink-200 dark:bg-pink-800",
]
const COMMANDS = ["SET x=1", "SET y=2", "INC x", "SET z=3", "DEC y"]

export default function LogReplication() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [explanation, setExplanation] = useState("The leader replicates log entries to all followers.")
  const [nextCommand, setNextCommand] = useState(0)

  // Initialize nodes
  useEffect(() => {
    resetSimulation()
  }, [])

  const resetSimulation = () => {
    setIsRunning(false)
    setMessages([])
    setNextCommand(0)
    setExplanation("The leader replicates log entries to all followers.")

    // Create 5 nodes with node 1 as the leader
    const newNodes: Node[] = []
    for (let i = 1; i <= 5; i++) {
      newNodes.push({
        id: i as NodeId,
        isLeader: i === 1,
        term: 1,
        log: [],
        commitIndex: -1,
      })
    }
    setNodes(newNodes)
  }

  // Add a new log entry to the leader
  const addLogEntry = () => {
    if (nextCommand >= COMMANDS.length) return

    setNodes((prevNodes) => {
      const newNodes = [...prevNodes]
      const leaderIndex = newNodes.findIndex((n) => n.isLeader)

      if (leaderIndex !== -1) {
        const newEntry: LogEntry = {
          term: newNodes[leaderIndex].term,
          command: COMMANDS[nextCommand],
          color: COLORS[nextCommand % COLORS.length],
        }

        newNodes[leaderIndex].log.push(newEntry)
        setExplanation(`Leader adds new log entry: ${newEntry.command}`)
        setNextCommand((prev) => prev + 1)
      }

      return newNodes
    })
  }

  // Simulation step
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      // Leader sends AppendEntries to all followers
      const leader = nodes.find((n) => n.isLeader)

      if (leader) {
        // Send AppendEntries to all followers
        const newMessages: Message[] = []

        for (let i = 1; i <= 5; i++) {
          if (i !== leader.id) {
            newMessages.push({
              id: `${Date.now()}-${leader.id}-${i}`,
              from: leader.id,
              to: i as NodeId,
              type: "appendEntries",
              entries: leader.log,
              term: leader.term,
              leaderCommit: leader.commitIndex,
            })
          }
        }

        if (newMessages.length > 0) {
          setMessages((prevMessages) => [...prevMessages, ...newMessages])
        }
      }

      // Process messages
      setMessages((prevMessages) => {
        const currentMessages = [...prevMessages]
        const processedMessageIds: string[] = []

        for (const message of currentMessages) {
          // Process AppendEntries
          if (message.type === "appendEntries") {
            const follower = nodes.find((n) => n.id === message.to)

            if (follower && !follower.isLeader && message.entries) {
              // Update follower's log
              setNodes((prevNodes) => {
                const newNodes = [...prevNodes]
                const nodeIndex = newNodes.findIndex((n) => n.id === message.to)

                if (nodeIndex !== -1) {
                  // Update log if term is valid
                  if (message.term >= newNodes[nodeIndex].term) {
                    newNodes[nodeIndex].log = [...message.entries]
                    newNodes[nodeIndex].term = message.term

                    // Update commit index
                    if (message.leaderCommit !== undefined && message.leaderCommit > newNodes[nodeIndex].commitIndex) {
                      newNodes[nodeIndex].commitIndex = Math.min(
                        message.leaderCommit,
                        newNodes[nodeIndex].log.length - 1,
                      )
                    }

                    // Send success response
                    const response: Message = {
                      id: `${Date.now()}-${message.to}-${message.from}-response`,
                      from: message.to,
                      to: message.from,
                      type: "appendEntriesResponse",
                      success: true,
                      term: message.term,
                    }

                    setMessages((prevMsgs) => [...prevMsgs, response])
                  }
                }

                return newNodes
              })
            }

            processedMessageIds.push(message.id)
          }

          // Process AppendEntries responses
          if (message.type === "appendEntriesResponse" && message.success) {
            const leader = nodes.find((n) => n.id === message.to)

            if (leader && leader.isLeader) {
              // Count successful responses
              const successfulResponses = messages.filter(
                (m) => m.type === "appendEntriesResponse" && m.success && m.to === leader.id && m.term === leader.term,
              ).length

              // If majority of nodes have replicated the log, commit
              if (successfulResponses >= 2) {
                // 2 responses + leader = majority of 5
                setNodes((prevNodes) => {
                  const newNodes = [...prevNodes]
                  const leaderIndex = newNodes.findIndex((n) => n.isLeader)

                  if (leaderIndex !== -1 && newNodes[leaderIndex].commitIndex < newNodes[leaderIndex].log.length - 1) {
                    newNodes[leaderIndex].commitIndex += 1
                    setExplanation(`Leader commits log entry at index ${newNodes[leaderIndex].commitIndex}`)
                  }

                  return newNodes
                })
              }
            }

            processedMessageIds.push(message.id)
          }
        }

        // Remove processed messages
        return currentMessages.filter((msg) => !processedMessageIds.includes(msg.id))
      })
    }, 500 / speed)

    return () => clearInterval(interval)
  }, [isRunning, nodes, speed, nextCommand])

  return (
    <div id="log-replication" className="space-y-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2 className="text-3xl font-bold text-foreground mb-4">Log Replication</h2>
        <p className="text-muted-foreground">
          Once a leader is elected, it begins servicing client requests. Each request contains a command to be executed
          by the replicated state machines. The leader appends the command to its log and then replicates it to all
          followers.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetSimulation}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={addLogEntry} disabled={nextCommand >= COMMANDS.length}>
                <Plus className="h-4 w-4 mr-2" />
                Add Log Entry
              </Button>
            </div>
            <div className="flex items-center space-x-4 w-1/3">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Slider value={[speed]} min={0.5} max={3} step={0.5} onValueChange={(value) => setSpeed(value[0])} />
              <span className="text-sm font-medium w-8">{speed}x</span>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-muted-foreground">{explanation}</p>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`border ${node.isLeader ? "border-green-500 dark:border-green-400 border-2" : "border-border"} rounded-lg p-4`}
              >
                <div className="text-center mb-2">
                  <div className="font-bold text-foreground">Node {node.id}</div>
                  <div className="text-xs text-muted-foreground">{node.isLeader ? "Leader" : "Follower"}</div>
                  <div className="text-xs text-muted-foreground">Term: {node.term}</div>
                </div>

                <div className="border border-border rounded bg-card p-2 h-48 overflow-y-auto">
                  <div className="text-xs font-semibold mb-1 text-foreground">Log Entries:</div>
                  {node.log.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">No entries</div>
                  ) : (
                    <div className="space-y-1">
                      {node.log.map((entry, index) => (
                        <motion.div
                          key={`${node.id}-${index}`}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-xs p-1 rounded ${entry.color} ${index <= node.commitIndex ? "border border-gray-500 dark:border-gray-400" : ""}`}
                        >
                          <div className="flex justify-between text-foreground">
                            <span>Term: {entry.term}</span>
                            <span>#{index}</span>
                          </div>
                          <div className="text-foreground">{entry.command}</div>
                          {index <= node.commitIndex && (
                            <div className="text-xs font-semibold text-foreground">Committed ✓</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Messages visualization */}
          <div className="relative h-20 mt-4">
            <AnimatePresence>
              {messages.map((message) => {
                const fromNode = message.from
                const toNode = message.to

                const fromX = (fromNode - 1) * 20 + (fromNode - 1) * 80 + 40
                const toX = (toNode - 1) * 20 + (toNode - 1) * 80 + 40

                const messageColor = message.type === "appendEntries" ? "bg-blue-500" : "bg-green-500"

                return (
                  <motion.div
                    key={message.id}
                    className={`absolute w-3 h-3 rounded-full ${messageColor}`}
                    initial={{ x: fromX, y: 0 }}
                    animate={{ x: toX, y: 10 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5 / speed }}
                  />
                )
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h3 className="text-2xl font-bold text-foreground mb-4">How Log Replication Works</h3>
        <ol className="space-y-4 text-muted-foreground">
          <li>
            <strong>Client Request:</strong> When the leader receives a client request, it adds the command to its log
            as a new entry.
          </li>
          <li>
            <strong>AppendEntries RPC:</strong> The leader sends AppendEntries RPCs to all followers to replicate the
            entry.
          </li>
          <li>
            <strong>Consistency Check:</strong> Followers verify that the log entries are consistent with their own logs
            before accepting new entries.
          </li>
          <li>
            <strong>Commit:</strong> Once a majority of followers have replicated an entry, the leader commits it and
            notifies the followers.
          </li>
          <li>
            <strong>Apply to State Machine:</strong> Once an entry is committed, it can be applied to the state machine
            on each server.
          </li>
        </ol>
      </div>
    </div>
  )
}

