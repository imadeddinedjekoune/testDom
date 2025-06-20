# Domino Hold'em - Bet Management System

## Overview

This is a React and Express-based web application designed to manage virtual money bets in a custom domino poker game. The system provides a digital interface for tracking players, handling betting actions (bet, call, raise, fold), and managing game state across multiple hands and rounds.

## System Architecture

The application follows a full-stack monorepo structure with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: Wouter (lightweight client-side routing)
- **Build Tool**: Vite with custom configuration for monorepo setup

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Dual storage implementation (in-memory for development, database for production)
- **API**: RESTful endpoints for game management

## Key Components

### Database Schema (PostgreSQL + Drizzle)
- **Games Table**: Tracks game sessions with player count, starting balance, current hand/round, pot size
- **Players Table**: Manages individual player state including balance, current bet, status, and position
- **Actions Table**: Records all betting actions with timestamps for audit trail

### Core Business Logic
- **Game Management**: Create games, track multiple hands, manage betting rounds (pre-flop, turn, river)
- **Player Actions**: Handle bet, call, raise, fold operations with balance validation
- **Pot Management**: Track total pot size and distribute winnings
- **Hand Progression**: Advance through betting rounds and start new hands

### User Interface Components
- **Game Setup Modal**: Configure new games with player count and starting balances
- **Players Table**: Real-time display of player status, balances, and current bets
- **Betting Actions**: Interface for executing player actions with amount validation
- **Action History**: Chronological log of all game actions
- **Game Statistics**: Current game state and historical metrics

## Data Flow

1. **Game Creation**: User sets up game parameters → Server creates game and players → Client updates UI
2. **Betting Actions**: Player selects action → Validation on client → API call → Database update → Real-time UI refresh
3. **Game State**: Client polls server every 2 seconds for real-time updates
4. **Hand Progression**: Manual advancement through betting rounds and hands via dedicated controls

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments

### UI Component Libraries
- **@radix-ui/react-***: Accessible, unstyled UI primitives (dialogs, selects, buttons, etc.)
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe CSS class composition

### Development Tools
- **vite**: Fast build tool with TypeScript support
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Hot Reload**: Vite dev server with HMR support
- **Database**: Local PostgreSQL instance
- **Port Configuration**: Server runs on port 5000, exposed as port 80

### Production Build
- **Client**: Vite builds React app to `dist/public`
- **Server**: esbuild bundles Express server to `dist/index.js`
- **Database**: Uses DATABASE_URL environment variable for connection
- **Deployment**: Autoscale deployment target with build and run commands

### Environment Configuration
- **Development**: `npm run dev` starts both client and server with hot reload
- **Production**: `npm run build` followed by `npm run start`
- **Database Migrations**: `npm run db:push` applies schema changes

## Recent Changes

### June 20, 2025 - Turn-Based Betting System & End Game Features
- **Automatic Turn Progression**: Eliminated manual player selection; system now automatically cycles through players (P1 → P2 → P3 → P1...)
- **Current Player Highlighting**: Active player is highlighted with blue border and "TURN" indicator
- **Traditional Poker Betting Rules**: 
  - First player sets initial bet amount
  - Subsequent players can only call (match amount), raise (increase amount), or fold
  - Bet amount persists across all three rounds (pre-flop, turn, river)
  - Call button shows exact amount needed
- **Enhanced Betting Interface**: 
  - Displays current bet amount and call amount for each turn
  - Disabled buttons when actions aren't available (e.g., can't bet if bet already exists)
  - Clear validation messages for invalid actions
- **End Game Feature**: Added "Game Winner" button to declare final winner who takes all remaining money
- **Separate Hand vs Game Winners**: "Hand Winner" wins current pot, "Game Winner" ends entire game

### Architecture Updates
- Added `currentPlayerTurn` and `currentBetAmount` fields to game schema
- Updated storage interface with turn management and bet amount tracking
- Enhanced API routes with proper poker betting logic validation
- Improved frontend state management for turn-based actions

### Bug Fixes (June 20, 2025)
- **Fixed Betting Calculations**: Corrected pot calculations to only add actual contributed amounts
- **Fixed Raise Logic**: When raising to amount X, current bet becomes exactly X (not X-1)
- **Fixed Call Logic**: Call amount now always equals the current bet amount exactly (if current bet is 15, call is 15)
- **Fixed Balance Updates**: Player balances now decrease by correct amounts contributed
- **Fixed End Game Logic**: Game winner now receives only the current pot, not all player money
- **Removed Blind Mechanics**: Simplified to standard betting without blind penalties
- **Improved Error Handling**: Added detailed logging for betting action debugging

## User Preferences

```
Preferred communication style: Simple, everyday language.
```