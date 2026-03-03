# AgencySync - Projekt-Status

## 📅 Datum
2026-03-03

## 🎯 Projekt-Übersicht
**AgencySync** - Ein SaaS Client Management Tool für kleine Marketing-Agenturen (1-10 Mitarbeiter)

## 📂 Projekt-Location
`/home/crankk/projects/agencysync/`

## ✅ Aktueller Status: MVP FERTIG

### Backend (Port 5000)
- Express.js Server mit SQLite Datenbank
- JWT Authentication (Register/Login)
- API Endpoints:
  - `/api/auth` - Authentication
  - `/api/clients` - Client Management
  - `/api/proposals` - Proposal Builder
  - `/api/tasks` - Task Management
  - `/api/time` - Time Tracking

### Frontend (Port 3001)
- React + TailwindCSS
- Features implementiert:
  - Login/Register
  - Dashboard mit Stats
  - Clients (CRUD + Modal)
  - Proposals (Status: Draft/Sent/Accepted/Rejected)
  - Tasks (Kanban Board mit Drag & Drop)
  - Time Tracking (Live Timer + manuelle Einträge)

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
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📋 Nächste Schritte (TODO)
1. ✅ MVP fertiggestellt
2. 🔄 Landing Page für Warteliste erstellen
3. 🔄 Stripe-Integration für Zahlungen
4. 🔄 Deployment auf VPS vorbereiten
5. 🔄 Domain kaufen + DNS einrichten
6. 🔄 SSL-Zertifikat (Let's Encrypt)

## 💡 Technische Notizen
- SQLite Datenbank: `~/projects/agencysync/backend/database/agencysync.db`
- Environment Variables in `.env` Datei
- Frontend Proxy auf Backend Port 5000 eingestellt

## 👤 Operator
Vitja (1048871280) - Beneficial Owner
