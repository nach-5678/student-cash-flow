# PocketTrack - Personal Finance Tracker

## Overview

PocketTrack is a modern personal finance tracking application built with React and Express.js. It provides users with comprehensive tools to monitor their income, expenses, budgets, and financial insights through an intuitive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Storage**: PostgreSQL-based sessions with connect-pg-simple
- **Development**: Hot module replacement with Vite middleware integration

## Key Components

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Tables**: users, categories, transactions, budgets, goals
- **Database Layer**: DatabaseStorage class implementing IStorage interface
- **Seeding**: Automated seed script with sample data for immediate testing
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)

### Authentication & Authorization
- **User Management**: Simple username-based system (hardcoded to "student" user)
- **Session Handling**: Express sessions with PostgreSQL store
- **Security**: Basic session-based authentication (simplified for demo)

### UI Components
- **Design System**: shadcn/ui with Radix UI primitives
- **Theme**: Customizable CSS variables with light/dark mode support
- **Responsive Design**: Mobile-first approach with Tailwind utilities
- **Charts**: Chart.js integration for spending analytics visualization

### Core Features
- **Dashboard**: Balance overview, quick actions, budget tracking
- **Transaction Management**: Add income/expenses with category support  
- **Budget Tracking**: Set and monitor category-based budgets with alerts
- **Analytics**: Spending insights, trends, and monthly financial summaries
- **Goal Tracking**: Financial goal setting with progress monitoring
- **Notification Center**: Smart budget warnings and financial tips
- **Multi-page Navigation**: Dedicated pages for Budget, Analytics, Transactions
- **Real-time Updates**: Optimistic updates with React Query

## Data Flow

1. **Client Requests**: Frontend components use React Query to fetch data
2. **API Layer**: Express.js routes handle HTTP requests and business logic
3. **Data Access**: Storage interface abstracts database operations
4. **Database**: PostgreSQL stores persistent data via Drizzle ORM
5. **Response**: JSON data flows back through the same path
6. **UI Updates**: React Query manages cache invalidation and re-rendering

### Transaction Flow Example
- User submits expense form → React Hook Form validation → API request via React Query → Express route → Storage interface → Database update → Response → UI update

## External Dependencies

### Frontend Dependencies
- **@radix-ui/**: Complete suite of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **date-fns**: Date manipulation utilities
- **wouter**: Lightweight routing solution

### Backend Dependencies
- **drizzle-orm**: Type-safe database ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime type validation and schema parsing

### Development Tools
- **Vite**: Build tool with fast HMR and TypeScript support
- **esbuild**: Fast JavaScript/TypeScript bundler for production
- **tsx**: TypeScript execution for Node.js development

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with nodemon-like functionality for auto-restart
- **Database**: Local PostgreSQL or Neon serverless connection
- **Integration**: Vite middleware serves frontend through Express in development

### Production Build
1. **Frontend Build**: Vite builds optimized static assets to `dist/public`
2. **Backend Build**: esbuild compiles TypeScript server to `dist/index.js`
3. **Static Serving**: Express serves frontend assets from `dist/public`
4. **Database**: Production PostgreSQL instance via DATABASE_URL environment variable

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Session Configuration**: Secure session handling in production

### Replit Integration
- **Development Banner**: Automatic Replit development environment detection
- **Cartographer Plugin**: Development-only Replit tooling integration
- **Runtime Error Overlay**: Enhanced error reporting in development