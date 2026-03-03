# AgencySync - Projekt-Status

## 📅 Datum
2026-03-03

## 🎯 Projekt-Übersicht
**AgencySync** - Ein SaaS Client Management Tool für kleine Marketing-Agenturen (1-10 Mitarbeiter)

## 📂 Projekt-Location
`/home/crankk/projects/agencysync/`

## ✅ Aktueller Status: MVP + LANDING PAGE + GITHUB

### Backend (Port 5000)
- Express.js Server mit SQLite Datenbank
- JWT Authentication (Register/Login)
- API Endpoints:
  - `/api/auth` - Authentication
  - `/api/clients` - Client Management
  - `/api/proposals` - Proposal Builder
  - `/api/tasks` - Task Management
  - `/api/time` - Time Tracking
  - `/api/waitlist` - Waitlist Signup

### Frontend (Port 3001)
- React + TailwindCSS + Inter Font
- Premium UI mit Violet/Indigo Gradient Design
- Features implementiert:
  - **Landing Page** (Warteliste, Pricing, Features)
  - Login/Register (modernes Design mit Glassmorphism)
  - Dashboard mit Stats + Quick Actions
  - Clients (Grid-View mit Search + Animationen)
  - Proposals (Status-Tracking mit Icons)
  - Tasks (Kanban Board mit Drag & Drop)
  - Time Tracking (Live Timer + manuelle Einträge)

### Design-Features
- Gradient Buttons (Violet → Indigo)
- Hover-Animationen (Lift + Shadow)
- Fade-In/Slide-In Animationen
- Glassmorphism Effects
- Rounded-2XL Cards
- Custom Scrollbar

## 🚀 Start-Befehle

```bash
# Backend starten
cd ~/projects/agencysync && npm run server

# Frontend starten (Port 3001, da 3000 belegt)
cd ~/projects/agencysync/frontend && PORT=3001 npm start

# Oder beides zusammen
cd ~/projects/agencysync && npm run dev
```

## 🌐 Zugriff
- Frontend: http://192.168.178.93:3001
- Backend API: http://192.168.178.93:5000
- Health Check: http://192.168.178.93:5000/api/health

## 🔥 Firewall-Status
- Port 3001/tcp: ALLOW Anywhere (Frontend)
- Port 5000/tcp: ALLOW Anywhere (Backend API)

## 🐙 GitHub Repository
- **URL:** https://github.com/Vitja1988/agencysync
- **Public:** Ja
- **Status:** Master branch pushed

## 📋 Nächste Schritte (TODO)
1. ✅ MVP fertiggestellt
2. ✅ Visuelles Redesign complete
3. ✅ Landing Page erstellt & gepusht
4. 🔄 Stripe-Integration für Zahlungen
5. 🔄 Deployment auf VPS vorbereiten
6. 🔄 Domain kaufen + DNS einrichten
7. 🔄 SSL-Zertifikat (Let's Encrypt)

## 💡 Technische Notizen
- SQLite Datenbank: `~/projects/agencysync/backend/database/agencysync.db`
- Environment Variables in `.env` Datei
- Frontend Proxy auf Backend Port 5000 eingestellt
- Git Repo initialisiert mit MVP-Commit

## 👤 Operator
Vitja (1048871280) - Beneficial Owner
