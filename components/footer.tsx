import { ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-muted-foreground">© {new Date().getFullYear()} Raft Consensus Protocol Explainer</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a
              href="https://raft.github.io/raft.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Raft Whitepaper
            </a>
            <a
              href="https://raft.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Raft Website
            </a>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            This interactive explainer is based on the Raft Consensus Algorithm by Diego Ongaro and John Ousterhout.
          </p>
          <p className="mt-1">
            Learn more about how distributed systems achieve consensus through this simplified visualization.
          </p>
        </div>
      </div>
    </footer>
  )
}

