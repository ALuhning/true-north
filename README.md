# True North or Not? 🍁🦅

A mobile-first, swipeable quiz game: **Is it Canadian or American?**

Swipe left = Canada 🇨🇦, swipe right = USA 🇺🇸. 20 rounds per session. Timed scoring. Live leaderboard.

## Quick Start

```bash
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3002
- Leaderboard updates live via WebSocket
- Admin panel: http://localhost:5173/admin (default password: truenorth2024)

## Features

- ✨ Swipeable card interface (mobile-first)
- ⏱️ Timed scoring with streak bonuses
- 🏆 Live leaderboard with real-time updates
- 📱 PWA support for offline play
- 🎯 20-question sessions with balanced content
- 🔒 Lightweight anti-abuse (device tracking)
- 👨‍💼 Admin panel for content management
- 🖥️ Kiosk mode with QR code for events
- 🖼️ High-quality images for each question

## Tech Stack

**Frontend:** React + TypeScript + Vite + Tailwind CSS + Zustand  
**Backend:** Node.js + Express + Socket.IO + SQLite  
**Gestures:** react-swipeable  
**PWA:** vite-plugin-pwa

## Scoring

- Correct answer: +100 base points
- Time bonus: up to +50 (linear decay over 6 seconds)
- Streak bonus: +10 per consecutive correct (caps at +50)
- Wrong answer: 0 points, streak resets
- Tiebreaker: total elapsed time (lower is better)

## Environment Variables

See `.env.example` for all configuration options:

- `ADMIN_PASSWORD` - Password for admin panel (default: truenorth2024)
- `PORT` - Server port (default: 3002)
- `VITE_API_URL` - API URL for frontend (auto-configured)

**Security Note:** Always change the default admin password in production!

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Railway deployment instructions.

## License

MIT
