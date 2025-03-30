"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RefreshCw } from "lucide-react"

type NodeState = "follower" | "candidate" | "leader"
type NodeId = 1 | 2 | 3 | 4 | 5

interface Node {
  id: NodeId
  state: NodeState
  term: number
  votedFor: NodeId | null
  electionTimeout: number
  timeoutCounter: number
}

interface Message {
  id: string
  from: NodeId
  to: NodeId
  type: "requestVote" | "voteGranted"
  term: number
}

export default function LeaderElection() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [explanation, setExplanation] = useState("All nodes start as followers with random election timeouts.")

  // Initialize nodes
  useEffect(() => {
    resetSimulation()
  }, [])

  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentStep(0)
    setMessages([])
    setExplanation("All nodes start as followers with random election timeouts.")

    // Create 5 nodes with random election timeouts
    const newNodes: Node[] = []
    for (let i = 1; i <= 5; i++) {
      newNodes.push({
        id: i as NodeId,
        state: "follower",
        term: 1,
        votedFor: null,
        electionTimeout: Math.floor(Math.random() * 300) + 300, // 300-600ms
        timeoutCounter: 0,
      })
    }
    setNodes(newNodes)
  }

  // Simulation step
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => prev + 1)

      // Update node timeouts
      setNodes((prevNodes) => {
        const newNodes = [...prevNodes]

        // Process timeouts and state changes
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]

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
          }
        }

        return newNodes
      })

      // Process messages
      setMessages((prevMessages) => {
        const currentMessages = [...prevMessages]
        const processedMessageIds: string[] = []

        for (const message of currentMessages) {
          // Process vote requests
          if (message.type === "requestVote") {
            const receivingNode = nodes.find((n) => n.id === message.to)

            if (receivingNode && receivingNode.state !== "leader") {
              // If the receiving node hasn't voted yet in this term and the candidate's term is >= the node's term
              if (
                (receivingNode.votedFor === null || receivingNode.votedFor === message.from) &&
                message.term >= receivingNode.term
              ) {
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
                setExplanation(`Node ${message.to} grants vote to node ${message.from} for term ${message.term}.`)
              }
            }

            processedMessageIds.push(message.id)
          }

          // Process vote granted
          if (message.type === "voteGranted") {
            const candidateNode = nodes.find((n) => n.id === message.to)

            if (candidateNode && candidateNode.state === "candidate" && candidateNode.term === message.term) {
              // Count votes for this candidate
              const votes = nodes.filter((n) => n.votedFor === candidateNode.id && n.term === candidateNode.term).length

              // If majority (including self-vote), become leader
              if (votes >= 3) {
                // 3 out of 5 is majority
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
        }

        // Remove processed messages
        return currentMessages.filter((msg) => !processedMessageIds.includes(msg.id))
      })
    }, 100 / speed)

    return () => clearInterval(interval)
  }, [isRunning, nodes, speed])

  const getNodeColor = (state: NodeState) => {
    switch (state) {
      case "follower":
        return "bg-gray-200 dark:bg-gray-700"
      case "candidate":
        return "bg-amber-200 dark:bg-amber-700"
      case "leader":
        return "bg-green-200 dark:bg-green-700"
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
    }
  }

  return (
    <div id="leader-election" className="space-y-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2 className="text-3xl font-bold text-foreground mb-4">Leader Election</h2>
        <p className="text-muted-foreground">
          In Raft, time is divided into terms of arbitrary length. Each term begins with an election, where one or more
          candidates attempt to become leader. If a candidate wins the election, it serves as leader for the rest of the
          term.
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

                const messageColor = message.type === "requestVote" ? "bg-blue-500" : "bg-green-500"

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

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
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
          </div>
        </CardContent>
      </Card>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h3 className="text-2xl font-bold text-foreground mb-4">How Leader Election Works</h3>
        <ol className="space-y-4 text-muted-foreground">
          <li>
            <strong>Follower State:</strong> All nodes start as followers. If followers don't hear from a leader, they
            become candidates.
          </li>
          <li>
            <strong>Candidate State:</strong> A candidate increments its term, votes for itself, and requests votes from
            other nodes.
          </li>
          <li>
            <strong>Vote Granting:</strong> Nodes grant their vote if they haven't voted in this term and the
            candidate's term is at least as up-to-date as their own.
          </li>
          <li>
            <strong>Leader Election:</strong> A candidate becomes leader if it receives votes from a majority of nodes
            (including itself).
          </li>
          <li>
            <strong>Split Votes:</strong> If multiple candidates split the vote, a new election will eventually be
            triggered when election timeouts expire.
          </li>
        </ol>
      </div>
    </div>
  )
}

