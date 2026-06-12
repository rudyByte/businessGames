# CampusEdge Launchpad — monorepo

Browser-based, gamified, and fully 3D entrepreneurship learning platform mapped to the Grade 7 Indian school curriculum.

## System Architecture

```
campusedge-launchpad/
├── apps/
│   ├── web/                          # React + Vite + TypeScript (R3F 3D Client)
│   └── api/                          # Express + TypeScript (API server)
├── packages/
│   └── shared/                       # Zod validation schemas & shared types
├── package.json                      # Workspaces configuration
└── README.md
```

## Local Setup

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Configure Environment Variables
1. Check the environment templates:
   - Backend: `apps/api/.env`
   - Frontend: `apps/web/.env`
2. Update `DATABASE_URL` in `apps/api/.env` to point to a valid PostgreSQL database (e.g. Supabase connection string).
3. Update `GEMINI_API_KEY` in `apps/api/.env` if you wish to run the live owl tutor and personalized quiz generator (otherwise, mock/fallbacks will be used automatically!).

### 3. Setup Database (Prisma)
Generate Prisma Client and run seed:
```bash
# Generate Prisma client library
npm run prisma:generate

# Run DB migrations
npm run prisma:migrate

# Seed demo schools, classrooms, faculty, students, and achievements
npm run prisma:seed
```

### 4. Start Development Servers
Run the full-stack workspaces concurrently:
```bash
npm run dev
```
- Frontend will boot up at: `http://localhost:5173`
- Backend API will start at: `http://localhost:3001`

---

## Test Login Credentials

| Role | Email | Password |
|---|---|---|
| **Student (Aryan)** | `aryan@student.com` | `User@123` |
| **Student (Priya)** | `priya@student.com` | `User@123` |
| **Teacher (Ms. Sharma)** | `sharma@dps.in` | `User@123` |
| **Parent (Mrs. Goel)** | `parent.goel@parent.com` | `User@123` |
| **Super Admin (Rajiv Sir)** | `admin@campusedge.in` | `Admin@123` |
