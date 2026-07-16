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

---

## Production Deployment Checklist & Post-Testing Guide 🚀

### 1. Environment Config Checklist
Create `/apps/api/.env` on your production server with:
- `PORT=3001`
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require` (Supabase/AWS RDS)
- `REDIS_URL=rediss://default:token@host:port` (Upstash / Redis Labs)
- `JWT_SECRET=your-32-character-secure-jwt-secret`
- `FRONTEND_URL=https://campusedge.in`

Create `/apps/web/.env` with:
- `VITE_API_URL=https://campusedge.in/api/v1`

### 2. Build & Start with PM2
To build and start in production:
```bash
# Install root workspace dependencies
npm install

# Build shared, backend and frontend packages
npm run build

# Run production database migrations
npx prisma migrate deploy -w apps/api

# Run PM2 process manager
pm2 start ecosystem.config.js --env production
```

### 3. Nginx Configuration
Place the template `nginx.conf` under `/etc/nginx/sites-available/campusedge.in`, enable it, and setup SSL certificates via Let's Encrypt Certbot:
```bash
sudo certbot --nginx -d campusedge.in -d www.campusedge.in
```

### 4. Post-Testing Verification Run
Verify the following functions on the production site:
1. **Demo Login**: Try Student/Teacher login.
2. **Interactive Map**: Navigate between chapters and buildings.
3. **Daily Chest**: Click on the chest on the map, claim rewards, verify it locks you out of double-claiming today.
4. **Detective Game**: Walk around, talk to NPCs, submit problem board.
5. **Strategy Simulator**: Setup name, strategy values, run transaction round, submit Shark Tank capstone.
6. **Leaderboard**: Verify classroom/school standings load.

