"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Database, Shield, Server, Clock, Key, Globe, FileCode } from "lucide-react"

interface UseCase {
  name: string
  description: string
  icon: React.ReactNode
  link: string
  category: string
}

const useCases: UseCase[] = [
  {
    name: "etcd",
    description: "Distributed key-value store used by Kubernetes for storing cluster state and configuration data.",
    icon: <Database className="h-8 w-8" />,
    link: "https://etcd.io/docs/latest/learning/why/",
    category: "Infrastructure",
  },
  {
    name: "Consul",
    description: "Service mesh solution providing service discovery, configuration, and segmentation functionality.",
    icon: <Globe className="h-8 w-8" />,
    link: "https://developer.hashicorp.com/consul/docs/architecture",
    category: "Service Discovery",
  },
  {
    name: "HashiCorp Vault",
    description:
      "Secrets management tool that securely stores and controls access to tokens, passwords, and certificates.",
    icon: <Shield className="h-8 w-8" />,
    link: "https://developer.hashicorp.com/vault/docs/concepts/integrated-storage",
    category: "Security",
  },
  {
    name: "TiKV",
    description:
      "Distributed transactional key-value database that powers TiDB, providing strong consistency and high availability.",
    icon: <Key className="h-8 w-8" />,
    link: "https://tikv.org/docs/6.1/concepts/raft/",
    category: "Database",
  },
  {
    name: "CockroachDB",
    description: "Distributed SQL database designed for global scale, strong consistency, and survivability.",
    icon: <Database className="h-8 w-8" />,
    link: "https://www.cockroachlabs.com/docs/stable/architecture/replication-layer.html",
    category: "Database",
  },
  {
    name: "InfluxDB",
    description:
      "Time series database optimized for high-write-volume workloads like monitoring, metrics, and IoT data.",
    icon: <Clock className="h-8 w-8" />,
    link: "https://docs.influxdata.com/influxdb/v2.0/reference/internals/clustering/",
    category: "Database",
  },
  {
    name: "Nomad",
    description: "Workload orchestrator for deploying and managing containers and non-containerized applications.",
    icon: <Server className="h-8 w-8" />,
    link: "https://developer.hashicorp.com/nomad/docs/internals/consensus",
    category: "Orchestration",
  },
  {
    name: "RethinkDB",
    description: "Open-source distributed document database with real-time change feeds and intuitive query language.",
    icon: <FileCode className="h-8 w-8" />,
    link: "https://rethinkdb.com/docs/architecture/",
    category: "Database",
  },
]

export default function UseCases() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">Real-World Use Cases</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The Raft consensus protocol is widely adopted in production systems. Here are some notable projects that
            implement Raft:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4 text-primary">{useCase.icon}</div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{useCase.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {useCase.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm flex-grow mb-4">{useCase.description}</p>
                  <a
                    href={useCase.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:underline mt-auto"
                  >
                    Learn more <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

