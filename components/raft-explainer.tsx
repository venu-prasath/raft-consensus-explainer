"use client"

import { motion } from "framer-motion"
import RaftIntro from "@/components/raft-intro"
import LeaderElection from "@/components/leader-election"
import LogReplication from "@/components/log-replication"
import FaultTolerance from "@/components/fault-tolerance"
import ThemeToggle from "@/components/theme-toggle"
import UseCases from "@/components/use-cases"
import Footer from "@/components/footer"

export default function RaftExplainer() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-grow">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Raft Consensus Protocol</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            An interactive visualization of how distributed systems achieve consensus
          </p>
        </motion.div>

        {/* Introduction Section */}
        <section className="mb-16">
          <RaftIntro />
        </section>

        {/* Leader Election Section */}
        <motion.section
          className="mb-16 pt-8 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <LeaderElection />
        </motion.section>

        {/* Log Replication Section */}
        <motion.section
          className="mb-16 pt-8 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <LogReplication />
        </motion.section>

        {/* Fault Tolerance Section */}
        <motion.section
          className="mb-16 pt-8 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <FaultTolerance />
        </motion.section>
      </div>

      <UseCases />
      <Footer />
    </div>
  )
}

