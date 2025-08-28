# Overview

This is a full-stack internship management system built with React, Express, and PostgreSQL. The application provides two interfaces: an intern dashboard for tracking progress, tasks, and meetings, and an admin dashboard for managing all interns, tasks, meetings, and certificates. The system features Excel sheet integration for data import, automated progress tracking based on task completion and attendance, automatic certificate generation, and real-time notifications.

## Excel Sheet Integration

The system now imports data from Excel sheets placed in the `excel-templates/` folder:

### Required Excel Files Structure:

**For Interns (`interns.json` or `interns.xlsx`):**
- username (unique identifier)
- password (login credential)
- name (full name)
- email (contact email)
- mobileNumber (with country code)
- department (work department)
- startDate (YYYY-MM-DD format)
- endDate (YYYY-MM-DD format)

**For Admins (`admins.json` or `admins.xlsx`):**
- username (unique identifier)
- password (login credential)
- name (full name)
- email (contact email)
- role (job title/role)

### Upload Process:
1. Place Excel files in `excel-templates/` folder
2. Name them `interns.json` and `admins.json` (JSON format currently supported)
3. Restart the application to import data
4. System validates and imports only new records

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Routing**: Wouter for client-side routing with two main routes (intern dashboard and admin dashboard)
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Organized into feature-based folders (admin/, intern/, ui/) with reusable UI components

## Backend Architecture
- **Express.js**: RESTful API server with middleware for logging, JSON parsing, and error handling
- **TypeScript**: Fully typed backend with ESM module system
- **Storage Pattern**: Interface-based storage layer (IStorage) for database abstraction
- **Route Organization**: Centralized route registration with CRUD endpoints for all entities
- **Error Handling**: Global error handler with proper HTTP status codes and JSON responses

## Database Design
- **PostgreSQL**: Primary database with connection via Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Structure**: Five main entities with proper relationships:
  - **Interns**: Core entity with profile information and progress tracking
  - **Tasks**: Assigned to interns with status tracking (todo, progress, completed)
  - **Meetings**: Scheduled events with attendee management
  - **Certificates**: Generated certificates linked to interns
  - **Notifications**: System notifications for interns
- **Data Validation**: Zod schemas for runtime validation matching database schema

## Authentication & Authorization
- **Simple Role-based Access**: Basic admin/intern role distinction
- **Session Management**: Simple password-based admin authentication (demo implementation)
- **Frontend Guards**: Route-level protection based on user role

## External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Extensive use of Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Icons**: Font Awesome for consistent iconography
- **Development Tools**: 
  - Replit-specific plugins for development environment
  - ESBuild for server bundling
  - PostCSS with Autoprefixer for CSS processing