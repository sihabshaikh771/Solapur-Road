# 🛣️ SolapurRoads

Community-driven road condition reporting and heat map platform for Solapur city.

## Features
- 📍 Upload photo/video reports with map location
- 🗺️ Live heat map (red = dangerous, yellow = medium, green = good)
- 🏆 Leaderboard with points and badges
- 🔐 Auth with JWT (sign up / login)
- 📱 Mobile-friendly responsive design

---

## Setup Guide

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste and run the contents of `database/schema.sql`
3. Go to **Storage** → Create bucket named `road-reports` → set to **Public**
4. Copy your **Project URL** and **anon key** from Settings → API

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your Supabase URL, service key, and a JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your API URL and Supabase credentials
npm run dev
```

### 4. Open
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/health

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=change-this-to-random-string
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Deployment (GitHub + Vercel + Railway)

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Backend → Railway
1. Push `backend/` to GitHub
2. Import in [railway.app](https://railway.app)
3. Add environment variables
4. Deploy → copy the URL

Then update `VITE_API_BASE_URL` in Vercel to your Railway URL.

---

## Points System
| Action | Points |
|--------|--------|
| Submit a report | +10 pts |
| First report on a road | +bonus 5 pts (planned) |

## Badges
| Badge | Points Required |
|-------|----------------|
| 🥉 Bronze | 0–99 |
| 🥈 Silver | 100–199 |
| 🥇 Gold | 200–499 |
| 💎 Diamond | 500+ |

---

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Leaflet.js + Framer Motion
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (photos/videos)
- **Auth**: JWT
