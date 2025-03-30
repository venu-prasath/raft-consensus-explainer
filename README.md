# Raft Consensus Protocol Explainer

An interactive web application that explains the Raft Consensus Protocol through visualizations and step-by-step breakdowns.

## Overview

This project aims to make the Raft Consensus Protocol more accessible and understandable through an interactive web interface. It breaks down the complex concepts of distributed consensus into digestible parts, helping users understand:

- Leader Election
- Log Replication
- Safety Properties
- Cluster Membership Changes
- Snapshot and Log Compaction

## Features

- Interactive visualizations of Raft protocol states
- Step-by-step explanations of protocol operations
- Real-time demonstrations of leader election and log replication
- Visual representation of cluster state changes
- Educational content with practical examples

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/venu-prasath/raft-explainer.git
cd raft-explainer
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
raft-explainer/
├── app/              # Next.js app directory
├── components/       # React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared logic
├── public/          # Static assets
└── styles/          # Global styles and Tailwind configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Raft Paper](https://raft.github.io/raft.pdf) - The original Raft consensus protocol paper
- [Raft Website](https://raft.github.io/) - Official Raft protocol website 