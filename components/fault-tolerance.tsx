"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RefreshCw, Power, PowerOff } from "lucide-react"

type NodeId = 1 | 2 | 3 | 4 | 5
type NodeState = "follower" | "candidate" | "leader" | "down"

interface Node {
  id: NodeId
  state: NodeState
  term: number
  votedFor: NodeId | null
  electionTimeout: number
  timeoutCounter: number
  log: { term: number; command: string }[]
  commitIndex: number
}

interface Message {
  id: string
  from: NodeId
  to: NodeId
  type: "requestVote" | "voteGranted" | "appendEntries" | "appendEntriesResponse"
  term: number
  success?: boolean
}

export default function FaultTolerance() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [explanation, setExplanation] = useState(
    "Raft can tolerate node failures as long as a majority of nodes are operational.",
  )
  const [scenario, setScenario] = useState<"leaderFailure" | "networkPartition" | "none">("none")
  const [scenarioStep, setScenarioStep] = useState(0)

  // Initialize nodes
  useEffect(() => {
    resetSimulation()
  }, [])

  const resetSimulation = () => {
    setIsRunning(false)
    setMessages([])
    setScenario("none")
    setScenarioStep(0)
    setExplanation("Raft can tolerate node failures as long as a majority of nodes are operational.")

    // Create 5 nodes with node 1 as the leader
    const newNodes: Node[] = []
    for (let i = 1; i <= 5; i++) {
      newNodes.push({
        id: i as NodeId,
        state: i === 1 ? "leader" : "follower",
        term: 1,
        votedFor: i === 1 ? (1 as NodeId) : null,
        electionTimeout: Math.floor(Math.random() * 300) + 300, // 300-600ms
        timeoutCounter: 0,
        log: [{ term: 1, command: "SET x=1" }],
        commitIndex: 0,
      })
    }
    setNodes(newNodes)
  }

  const toggleNodeStatus = (nodeId: NodeId) => {
    setNodes((prevNodes) => {
      const newNodes = [...prevNodes]
      const nodeIndex = newNodes.findIndex((n) => n.id === nodeId)

      if (nodeIndex !== -1) {
        // Toggle between down and follower
        newNodes[nodeIndex].state = newNodes[nodeIndex].state === "down" ? "follower" : "down"

        if (newNodes[nodeIndex].state === "down") {
          setExplanation(`Node ${nodeId} has failed.`)
        } else {
          setExplanation(`Node ${nodeId} has recovered.`)
          // Reset timeout when node recovers
          newNodes[nodeIndex].timeoutCounter = 0
        }
      }

      return newNodes
    })
  }

  const simulateLeaderFailure = () => {
    setScenario("leaderFailure")
    setScenarioStep(0)
    setExplanation("Simulating leader failure scenario...")
    setIsRunning(true)
  }

  const simulateNetworkPartition = () => {
    setScenario("networkPartition")
    setScenarioStep(0)
    setExplanation("Simulating network partition scenario...")
    setIsRunning(true)
  }

  // Simulation step
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      // Handle scenarios
      if (scenario === "leaderFailure") {
        if (scenarioStep === 0) {
          // Find current leader
          const leaderIndex = nodes.findIndex((n) => n.state === "leader")
          if (leaderIndex !== -1) {
            // Make leader fail
            setNodes((prevNodes) => {
              const newNodes = [...prevNodes]
              newNodes[leaderIndex].state = "down"
              setExplanation(`Leader (Node ${newNodes[leaderIndex].id}) has failed. Waiting for a new election...`)
              return newNodes
            })
          }
          setScenarioStep(1)
        }
      } else if (scenario === "networkPartition") {
        if (scenarioStep === 0) {
          // Create a network partition: nodes 1-2 on one side, 3-5 on the other
          setNodes((prevNodes) => {
            const newNodes = [...prevNodes]
            // Simulate partition by making nodes unable to communicate
            // In a real implementation, we would filter messages, but for simplicity
            // we'll just mark nodes 3-5 as down temporarily
            for (let i = 2; i < newNodes.length; i++) {
              newNodes[i].state = "down"
            }
            setExplanation("Network partition occurred: Nodes 1-2 separated from Nodes 3-5.")
            return newNodes
          })
          setScenarioStep(1)
        } else if (scenarioStep === 10) {
          // After some time, heal the partition
          setNodes((prevNodes) => {
            const newNodes = [...prevNodes]
            // Restore all nodes
            for (let i = 0; i < newNodes.length; i++) {
              if (newNodes[i].state === "down") {
                newNodes[i].state = "follower"
                newNodes[i].timeoutCounter = 0
              }
            }
            setExplanation("Network partition healed. Cluster will re-establish consensus.")
            return newNodes
          })
          setScenarioStep(11)
        } else if (scenarioStep < 20) {
          setScenarioStep((prev) => prev + 1)
        }
      }

      // Update node timeouts
      setNodes((prevNodes) => {
        const newNodes = [...prevNodes]

        // Process timeouts and state changes
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]

          // Skip down nodes
          if (node.state === "down") continue

          // Only followers and candidates have timeouts
          if (node.state !== "leader") {
            node.timeoutCounter += 100 * speed

            // Election timeout expired for a follower
            if (node.state === "follower" && node.timeoutCounter >= node.electionTimeout) {
              node.state = "candidate"
              node.term += 1
              node.votedFor = node.id
              node.timeoutCounter = 0

              // Send RequestVote to all other nodes
              const newMessages: Message[] = []
              for (let j = 1; j <= 5; j++) {
                if (j !== node.id) {
                  newMessages.push({
                    id: `${Date.now()}-${node.id}-${j}`,
                    from: node.id,
                    to: j as NodeId,
                    type: "requestVote",
                    term: node.term,
                  })
                }
              }

              setMessages((prevMessages) => [...prevMessages, ...newMessages])
              setExplanation(`Node ${node.id} becomes a candidate for term ${node.term} and requests votes.`)
            }
          } else if (node.state === "leader") {
            // Leader sends heartbeats/AppendEntries
            const newMessages: Message[] = []
            for (let j = 1; j <= 5; j++) {
              if (j !== node.id) {
                newMessages.push({
                  id: `${Date.now()}-${node.id}-${j}`,
                  from: node.id,
                  to: j as NodeId,
                  type: "appendEntries",
                  term: node.term,
                })
              }
            }

            setMessages((prevMessages) => [...prevMessages, ...newMessages])
          }
        }

        return newNodes
      })

      // Process messages
      setMessages((prevMessages) => {
        const currentMessages = [...prevMessages]
        const processedMessageIds: string[] = []

        for (const message of currentMessages) {
          const fromNode = nodes.find((n) => n.id === message.from)
          const toNode = nodes.find((n) => n.id === message.to)

          // Skip if either node is down
          if (!fromNode || !toNode || fromNode.state === "down" || toNode.state === "down") {
            processedMessageIds.push(message.id)
            continue
          }

          // Process vote requests
          if (message.type === "requestVote") {
            // If the receiving node hasn't voted yet in this term and the candidate's term is >= the node's term
            if ((toNode.votedFor === null || toNode.votedFor === message.from) && message.term >= toNode.term) {
              // Grant vote
              setNodes((prevNodes) => {
                const newNodes = [...prevNodes]
                const nodeIndex = newNodes.findIndex((n) => n.id === message.to)

                if (nodeIndex !== -1) {
                  newNodes[nodeIndex].votedFor = message.from
                  newNodes[nodeIndex].term = message.term
                  newNodes[nodeIndex].timeoutCounter = 0 // Reset timeout after voting
                }

                return newNodes
              })

              // Send vote granted message
              const voteGrantedMessage: Message = {
                id: `${Date.now()}-${message.to}-${message.from}-vote`,
                from: message.to,
                to: message.from,
                type: "voteGranted",
                term: message.term,
              }

              setMessages((prevMsgs) => [...prevMsgs, voteGrantedMessage])
            }

            processedMessageIds.push(message.id)
          }

          // Process vote granted
          if (message.type === "voteGranted") {
            const candidateNode = nodes.find((n) => n.id === message.to)

            if (candidateNode && candidateNode.state === "candidate" && candidateNode.term === message.term) {
              // Count votes for this candidate
              const votes = nodes.filter(
                (n) => n.votedFor === candidateNode.id && n.term === candidateNode.term && n.state !== "down",
              ).length

              // If majority (including self-vote), become leader
              const activeNodes = nodes.filter((n) => n.state !== "down").length
              if (votes > activeNodes / 2) {
                setNodes((prevNodes) => {
                  const newNodes = [...prevNodes]
                  const nodeIndex = newNodes.findIndex((n) => n.id === message.to)

                  if (nodeIndex !== -1 && newNodes[nodeIndex].state === "candidate") {
                    newNodes[nodeIndex].state = "leader"
                    setExplanation(
                      `Node ${message.to} becomes leader for term ${message.term} after receiving majority votes.`,
                    )
                  }

                  return newNodes
                })
              }
            }

            processedMessageIds.push(message.id)
          }

          // Process AppendEntries (heartbeats)
          if (message.type === "appendEntries") {
            // If the message term is >= the node's term, accept it as a heartbeat
            if (message.term >= toNode.term) {
              setNodes((prevNodes) => {
                const newNodes = [...prevNodes]
                const nodeIndex = newNodes.findIndex((n) => n.id === message.to)

                if (nodeIndex !== -1) {
                  // If this node was a candidate, revert to follower
                  if (newNodes[nodeIndex].state === "candidate") {
                    newNodes[nodeIndex].state = "follower"
                  }

                  newNodes[nodeIndex].term = message.term
                  newNodes[nodeIndex].timeoutCounter = 0 // Reset timeout after receiving heartbeat
                }

                return newNodes
              })

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

            processedMessageIds.push(message.id)
          }
        }

        // Remove processed messages
        return currentMessages.filter((msg) => !processedMessageIds.includes(msg.id))
      })
    }, 200 / speed)

    return () => clearInterval(interval)
  }, [isRunning, nodes, speed, scenario, scenarioStep])

  const getNodeColor = (state: NodeState) => {
    switch (state) {
      case "follower":
        return "bg-gray-200 dark:bg-gray-700"
      case "candidate":
        return "bg-amber-200 dark:bg-amber-700"
      case "leader":
        return "bg-green-200 dark:bg-green-700"
      case "down":
        return "bg-red-200 dark:bg-red-700"
    }
  }

  const getNodeBorder = (state: NodeState) => {
    switch (state) {
      case "follower":
        return "border-gray-400 dark:border-gray-500"
      case "candidate":
        return "border-amber-400 dark:border-amber-500"
      case "leader":
        return "border-green-500 dark:border-green-400 border-2"
      case "down":
        return "border-red-500 dark:border-red-400 border-2"
    }
  }

  return (
    <div id="fault-tolerance" className="space-y-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2 className="text-3xl font-bold text-foreground mb-4">Fault Tolerance</h2>
        <p className="text-muted-foreground">
          Raft is designed to maintain consensus even when nodes fail or the network experiences issues. As long as a
          majority of nodes are operational and can communicate, the cluster can continue to function.
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
            </div>
            <div className="flex items-center space-x-4 w-1/3">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Slider value={[speed]} min={0.5} max={3} step={0.5} onValueChange={(value) => setSpeed(value[0])} />
              <span className="text-sm font-medium w-8">{speed}x</span>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateLeaderFailure}
              disabled={isRunning && scenario !== "none"}
            >
              Simulate Leader Failure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={simulateNetworkPartition}
              disabled={isRunning && scenario !== "none"}
            >
              Simulate Network Partition
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-muted-foreground">{explanation}</p>
          </div>

          <div className="relative h-80 bg-card rounded-lg border border-border overflow-hidden">
            {/* Nodes */}
            <div className="absolute inset-0 flex items-center justify-center">
              {nodes.map((node, index) => {
                const angle = index * ((2 * Math.PI) / 5) - Math.PI / 2
                const radius = 120
                const x = radius * Math.cos(angle) + 250
                const y = radius * Math.sin(angle) + 150

                return (
                  <motion.div
                    key={node.id}
                    className={`absolute w-16 h-16 rounded-full flex items-center justify-center border ${getNodeBorder(node.state)} ${getNodeColor(node.state)}`}
                    style={{ left: x, top: y }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="text-center">
                      <div className="font-bold text-foreground">{node.id}</div>
                      <div className="text-xs text-foreground">{node.state}</div>
                      <div className="text-xs text-foreground">Term: {node.term}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mt-1"
                        onClick={() => toggleNodeStatus(node.id)}
                      >
                        {node.state === "down" ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Messages */}
            <AnimatePresence>
              {messages.map((message) => {
                const fromNode = nodes.find((n) => n.id === message.from)
                const toNode = nodes.find((n) => n.id === message.to)

                if (!fromNode || !toNode) return null

                const fromAngle = (fromNode.id - 1) * ((2 * Math.PI) / 5) - Math.PI / 2
                const toAngle = (toNode.id - 1) * ((2 * Math.PI) / 5) - Math.PI / 2

                const radius = 120
                const fromX = radius * Math.cos(fromAngle) + 250
                const fromY = radius * Math.sin(fromAngle) + 150
                const toX = radius * Math.cos(toAngle) + 250
                const toY = radius * Math.sin(toAngle) + 150

                let messageColor
                switch (message.type) {
                  case "requestVote":
                    messageColor = "bg-blue-500"
                    break
                  case "voteGranted":
                    messageColor = "bg-green-500"
                    break
                  case "appendEntries":
                    messageColor = "bg-purple-500"
                    break
                  case "appendEntriesResponse":
                    messageColor = "bg-yellow-500"
                    break
                  default:
                    messageColor = "bg-gray-500"
                }

                return (
                  <motion.div
                    key={message.id}
                    className={`absolute w-3 h-3 rounded-full ${messageColor}`}
                    initial={{ x: fromX + 8, y: fromY + 8 }}
                    animate={{ x: toX + 8, y: toY + 8 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5 / speed }}
                  />
                )
              })}
            </AnimatePresence>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></div>
              <span className="text-foreground">Follower</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-700 mr-2"></div>
              <span className="text-foreground">Candidate</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-200 dark:bg-green-700 mr-2"></div>
              <span className="text-foreground">Leader</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-200 dark:bg-red-700 mr-2"></div>
              <span className="text-foreground">Down</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h3 className="text-2xl font-bold text-foreground mb-4">Fault Scenarios</h3>

        <h4 className="text-xl font-semibold mt-6">Leader Failure</h4>
        <p className="text-muted-foreground">
          When a leader fails, followers will stop receiving heartbeats and eventually time out. This triggers a new
          election, and a new leader will be elected from the remaining nodes.
        </p>

        <h4 className="text-xl font-semibold mt-6">Network Partition</h4>
        <p className="text-muted-foreground">
          If the network is partitioned, nodes in the minority partition cannot elect a new leader (they can't get a
          majority of votes). The majority partition will either keep the current leader or elect a new one. When the
          partition heals, nodes in the minority partition will recognize the higher term number from the majority
          partition and follow that leader.
        </p>

        <h4 className="text-xl font-semibold mt-6">Key Properties</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <strong>Safety:</strong> Raft never returns incorrect results under any conditions, including network
            delays, partitions, and packet loss.
          </li>
          <li>
            <strong>Availability:</strong> The cluster remains available as long as a majority of servers are
            operational and can communicate with each other and with clients.
          </li>
          <li>
            <strong>Consistency:</strong> All nodes see the same sequence of state changes, ensuring that the
            distributed system behaves as a single coherent entity.
          </li>
        </ul>
      </div>
    </div>
  )
}

