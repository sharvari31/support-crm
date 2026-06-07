# 🎫 SupportCRM

A full-stack customer support ticketing system built with Node.js, Express, SQLite, and React.

## 🔗 Live Demo
https://support-crm-t4cs.onrender.com

## 💻 Tech Stack
- **Backend:** Node.js + Express + SQLite (sql.js)
- **Frontend:** React + Vite + Tailwind CSS
- **Deployment:** Render

## ✨ Features
- Create support tickets with customer info
- List all tickets with stats dashboard
- Real-time search across name, email, ID, description
- Filter tickets by status
- View ticket details and update status
- Add internal notes with activity timeline
- Priority levels (Low, Medium, High)
- Copy ticket ID with one click

## 🚀 Setup Instructions

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints
- `POST /api/tickets` — Create a ticket
- `GET /api/tickets` — List all tickets (supports ?search= and ?status=)
- `GET /api/tickets/:ticket_id` — Get ticket details
- `PUT /api/tickets/:ticket_id` — Update status or add note

## 🔧 Environment Variables
```
NODE_ENV=production
VITE_API_URL=https://your-render-url.onrender.com
```
