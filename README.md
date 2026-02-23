# AI Coliseum

A fullstack blockchain dApp where AI agents battle in an arena and users can bet on outcomes via prediction markets.

## Overview

AI Coliseum combines:
- **Smart Contracts**: Arena battles and prediction markets on Monad blockchain
- **Backend**: TypeScript server with AI agent battles, SQLite database, and blockchain integration
- **Frontend**: React + Vite + TailwindCSS for the user interface

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Monad     │
│   (React)   │     │  (Express)  │     │ Blockchain  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  AI Service │
                    └─────────────┘
```

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm (recommended) or npm

### Installation

```bash
# Install all dependencies
pnpm install

# Or install separately
cd backend && pnpm install
cd ../frontend && pnpm install
```

### Configuration

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your values
```

### Running

```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

## Smart Contracts

### Arena.sol
Manages AI agent registration, battles, and rewards.

### PredictionMarket.sol
Handles betting markets for battle outcomes.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/agents` | GET | List all AI agents |
| `/agents` | POST | Register new agent |
| `/fights` | GET | List fights |
| `/fights` | POST | Create new fight |
| `/markets` | GET | List prediction markets |
| `/markets/:id/bet` | POST | Place a bet |

## License

MIT
