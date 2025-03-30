"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown } from "lucide-react"

export default function RaftIntro() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="prose prose-lg dark:prose-invert max-w-none"
      >
        <h2 className="text-3xl font-bold text-foreground mb-4">What is Raft?</h2>
        <p className="text-muted-foreground">
          Raft is a consensus algorithm designed to be easy to understand. It solves the problem of getting multiple
          servers to agree on a shared state even in the face of failures.
        </p>

        <p className="text-muted-foreground mt-4">
          Raft was designed as an alternative to Paxos, which is notoriously difficult to understand and implement
          correctly. Raft separates the key elements of consensus into three phases:
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Leader Election</h3>
              <p className="text-muted-foreground mb-4">Selecting a single server to act as the leader for a term</p>
              <Button variant="outline" className="w-full" onClick={() => scrollToSection("leader-election")}>
                Explore <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Log Replication</h3>
              <p className="text-muted-foreground mb-4">Replicating state machine commands across all servers</p>
              <Button variant="outline" className="w-full" onClick={() => scrollToSection("log-replication")}>
                Explore <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Fault Tolerance</h3>
              <p className="text-muted-foreground mb-4">
                Maintaining consensus even when nodes fail or network partitions occur
              </p>
              <Button variant="outline" className="w-full" onClick={() => scrollToSection("fault-tolerance")}>
                Explore <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-muted p-6 rounded-lg mt-8"
      >
        <h3 className="text-xl font-semibold mb-4">Key Properties of Raft</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm mr-3 mt-0.5">
              1
            </span>
            <span>
              <strong>Safety:</strong> Raft never returns incorrect results under any conditions
            </span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm mr-3 mt-0.5">
              2
            </span>
            <span>
              <strong>Availability:</strong> The system remains operational as long as a majority of servers are
              functioning
            </span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm mr-3 mt-0.5">
              3
            </span>
            <span>
              <strong>Timing independence:</strong> Faulty clocks and extreme message delays can, at worst, cause
              availability problems
            </span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm mr-3 mt-0.5">
              4
            </span>
            <span>
              <strong>Understandability:</strong> Designed to be easy to understand and implement
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  )
}

