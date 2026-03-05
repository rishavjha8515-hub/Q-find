# ⬡ Q-FIND

**Quantum-cryptographic Urban Scavenger Hunt Engine**

A real-time GPS-based scavenger hunt system for Hack Club: The Game (Manhattan, May 2026) featuring quantum decoherence mechanics, SHA-256 rolling hash anti-cheat, and live team analytics.

![Q-Find Banner](https://img.shields.io/badge/Status-Production%20Ready-00f5d4?style=for-the-badge)
![Hours Logged](https://img.shields.io/badge/Hours%20Logged-40%2B-9b5de5?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20WebSocket-fee440?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-q--find--five.vercel.app-00f5d4?style=for-the-badge&logo=vercel)](https://q-find-five.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-q--find--backend.onrender.com-9b5de5?style=for-the-badge&logo=render)](https://q-find-backend.onrender.com/)

---

## 🌐 Live Demo

**Frontend:** [https://q-find-five.vercel.app/](https://q-find-five.vercel.app/)  
**Backend:** [https://q-find-backend.onrender.com/](https://q-find-backend.onrender.com/) *(free tier — may sleep after inactivity)*

---

## 🎯 Project Overview

Q-Find is a quantum-inspired scavenger hunt platform where teams race across Manhattan to scan QR codes at 20 iconic landmarks. The twist? Your team's "qubit stability" decays exponentially over time using **P(t) = e^(-γt)**, forcing strategic movement and time management.

### Built For
- **Event:** Hack Club: The Game
- **Location:** Manhattan, NYC
- **Date:** May 22-25, 2026
- **Purpose:** 40-hour qualifying project for event entry

### Core Innovation
- **SHA-256 Rolling Hashes:** QR codes rotate every 60 seconds, preventing spoofing
- **Quantum Decoherence Physics:** Based on research paper on wave mechanics
- **GPS Perturbation:** Movement speed and proximity affect decay rate
- **Real-time WebSocket:** Instant leaderboard updates across all teams

---

## ✨ Features

### 🔐 Anti-Cheat Cryptography
- **HMAC-SHA256** rolling hash generation
- 60-second time windows with ±1 drift tolerance
- QR format: `QFIND|LANDMARK_ID|HASH_PREFIX`
- Server-side validation only

### ⚛️ Quantum Decoherence Engine
```
P(t) = e^(-γt)
where γ = 0.02 s⁻¹
```
- Stability decays from 100% → 0% over time
- Scanner locks at 0% until error correction puzzle solved
- +20% boost on successful check-in
- GPS-based perturbation modifiers

### 📍 GPS Integration
- **Haversine distance** calculations
- Proximity bonuses (within 100m of unclaimed landmark)
- Movement speed detection (anti-driving protection)
- Idle penalties (5+ minutes inactive)

### 🎮 Extended Gameplay
- **20 NYC Landmarks** across 8 zones
- **5 Power-ups:** Quantum Stabilizer, Hadamard Gate, Entanglement Boost, Zeno Effect, Quantum Radar
- **10 Achievements** with milestone rewards
- **Zone bonuses:** Brooklyn +20%, Chelsea +15%, etc.

### 📊 Real-time Dashboard
- WebSocket live updates (5s tick rate)
- Team leaderboard with stability tracking
- Performance analytics with distribution charts
- Admin panel for game moderation

### 🎨 UI/UX
- Mobile-first responsive design
- Dark cyberpunk theme (#020409 bg, #00f5d4 accents)
- Sound effects with Web Audio API
- PWA support (installable on phone)
- Accessibility: high contrast, reduced motion

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + Vite
- **qrcode.react** - QR generation
- **jsQR** - Camera scanning
- **Web Audio API** - Sound effects
- **WebSocket client** - Real-time updates

### Backend
- **Node.js** + Express
- **ws** - WebSocket server
- **crypto** (built-in) - SHA-256 HMAC
- **In-memory state** (upgrade to Redis for production)

### Libraries
```json
{
  "express": "^4.18.2",
  "ws": "^8.14.2",
  "cors": "^2.8.5",
  "qrcode.react": "^3.1.0",
  "jsqr": "^1.4.0"
}
```

---

## 📁 Project Structure

```
Q-FIND/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── Scanner.jsx           # Phone camera QR scanner
│   │   │   ├── QubitStatus.jsx       # Qubit ring visualization
│   │   │   ├── TeamDashboard.jsx     # Leaderboard
│   │   │   ├── Analytics.jsx         # Stats dashboard
│   │   │   ├── AdminPanel.jsx        # Game management
│   │   │   ├── GPSTracker.jsx        # Location tracking
│   │   │   ├── PuzzleModal.jsx       # Error correction
│   │   │   └── SettingsPanel.jsx     # User preferences
│   │   ├── hooks/
│   │   │   └── useWebSocket.js       # WebSocket hook
│   │   ├── utils/
│   │   │   └── sounds.js             # Audio system
│   │   ├── App.jsx                   # Main app
│   │   └── App.css                   # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/
│   │   ├── qr.js                     # QR generation/validation
│   │   ├── qubit.js                  # Qubit state management
│   │   └── admin.js                  # Admin endpoints
│   ├── qubit/
│   │   ├── engine.js                 # Decoherence physics
│   │   └── perturbation.js           # GPS modifiers
│   ├── ws/
│   │   └── websocket.js              # WebSocket server
│   └── index.js                      # Express app
├── shared/                 # Shared code
│   ├── crypto.js                     # Hash generation
│   ├── landmark.js                   # 6 original landmarks
│   ├── landmarks-extended.js         # 20 total landmarks
│   ├── puzzles.js                    # Error correction questions
│   ├── powerups.js                   # Power-up system
│   ├── achievements.js               # Achievement system
│   └── haversine.js                  # GPS distance calc
├── .env                    # Environment variables
├── package.json            # Root dependencies
└── README.md               # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ (check: `node -v`)
- npm 9+ (check: `npm -v`)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Q-find.git
cd Q-find
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Client dependencies
cd client
npm install
cd ..
```

3. **Configure environment**
```bash
# Create .env file
echo "PORT=3000" > .env
echo "VITE_API_URL=http://localhost:3000" >> .env
```

4. **Update API URLs**

Get your local IP address:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Update these files with your IP:
- `client/src/App.jsx` (line 11)
- `client/src/components/Scanner.jsx` (line 6)
- `client/src/components/QubitStatus.jsx` (line 8)
- `client/src/hooks/useWebSocket.js` (line 5)
- All other component API constants

5. **Start the servers**

**Terminal 1 (Backend):**
```bash
node server/index.js
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

6. **Open in browser**
- Desktop: `http://localhost:5173`
- Phone: `http://YOUR_IP:5173`

---

## 📱 Usage

### For Teams

1. **Choose Team ID** - Enter unique identifier (e.g., `TEAM_ALPHA`)
2. **Start GPS Tracking** - Enable location in GPS tab
3. **Scan QR Codes** - Use Scanner tab to scan at landmarks
4. **Monitor Stability** - Watch qubit decay in Qubit Status tab
5. **Solve Puzzles** - When locked, answer physics questions to restore

### For Admins

1. Navigate to **Admin tab**
2. Enter password: `quantum2026`
3. Manage teams:
   - Reset team progress
   - Unlock locked teams
   - Set stability manually
   - Delete teams
   - Reset all (nuclear option)

### For Spectators

1. Check **Leaderboard tab** for rankings
2. View **Analytics tab** for live statistics
3. Watch stability distribution in real-time

---

## 🎮 Game Mechanics

### Qubit Stability

**Initial State:** 100% at game start

**Decay Formula:**
```
P(t) = e^(-γt)
where:
  P(t) = stability at time t
  γ = 0.02 s⁻¹ (base decoherence constant)
  t = seconds since last check-in
```

**Modifiers:**
- ✅ **Check-in:** +20% stability
- ⚠️ **Idle (5+ min):** +10-50% decay rate
- 🏃 **Movement:** Speed-based perturbation
- 📍 **Distance:** Far from landmarks = faster decay
- 🎯 **Proximity:** Near unclaimed landmark = -20% decay

**Lock Condition:**
When stability hits 0%, scanner locks until error correction puzzle solved.

### Power-ups (Cost in Checkpoints)

| Power-up | Cost | Effect | Duration |
|----------|------|--------|----------|
| 🛡️ Quantum Stabilizer | 3 | Reduce γ by 50% | 5 min |
| ⚡ Hadamard Gate | 5 | Instant 100% restore | Instant |
| 🌟 Entanglement Boost | 2 | Next check-in +40% | 10 min |
| ❄️ Quantum Zeno Effect | 4 | Freeze decay | 3 min |
| 📡 Quantum Radar | 2 | Reveal 3 landmarks | 5 min |

### Achievements

- 🎯 **First Steps** - Complete first check-in (50 pts)
- ⭐ **Getting Started** - 5 check-ins (100 pts)
- 🗺️ **Explorer** - 10 check-ins (instant restore)
- 🌆 **Borough Hopper** - Visit all 8 zones (500 pts)
- ⚡ **Quantum Speedster** - 5 check-ins in <1 hour (freeze decay)
- 🛡️ **Decoherence Survivor** - Maintain >50% for 30min (250 pts)
- 🧩 **Error Correction Master** - Solve 5 puzzles (gamma reducer)
- 🌉 **Brooklyn Adventurer** - Complete all Brooklyn landmarks (300 pts)
- 🌙 **Night Owl** - Check-in midnight-6AM (150 pts)
- 💎 **Quantum Perfectionist** - Reach 100% (100 pts)

---

## 🗺️ Landmarks (20 Total)

### Midtown (6)
- **ESB** - Empire State Building (100 pts)
- **TIME** - Times Square (75 pts)
- **FLTN** - Flatiron Building (100 pts)
- **ROCK** - Rockefeller Center (100 pts)
- **GCTS** - Grand Central Terminal (100 pts)
- **NYPL** - NY Public Library (100 pts)

### Downtown (4)
- **BKBR** - Brooklyn Bridge (100 pts)
- **911M** - 9/11 Memorial (125 pts)
- **WLSP** - Wall Street Bull (100 pts)
- **STFE** - Staten Island Ferry (125 pts)

### Brooklyn (3)
- **CONY** - Coney Island (150 pts)
- **DUMB** - DUMBO Waterfront (150 pts)
- **PROS** - Prospect Park (150 pts)

### Other Zones (7)
- **CENT** - Central Park Bethesda (Uptown, 100 pts)
- **HIGH** - The High Line (Chelsea, 125 pts)
- **UNSC** - United Nations HQ (Midtown, 125 pts)
- **WTSQ** - Washington Square Park (Greenwich Village, 100 pts)
- **CHTN** - Chinatown Gate (Chinatown, 100 pts)
- **SOHO** - SoHo Cast Iron (SoHo, 125 pts)
- **CHEL** - Chelsea Market (Chelsea, 100 pts)

---

## 🔌 API Reference

### QR Endpoints

#### `GET /api/qr/landmarks`
Returns all public landmarks (without secrets).

**Response:**
```json
{
  "landmarks": [
    {
      "id": "ESB",
      "name": "Empire State Building",
      "zone": "Midtown",
      "lat": 40.7484,
      "lng": -73.9857,
      "hint": "Look up — it touches the clouds",
      "points": 100
    }
  ]
}
```

#### `GET /api/qr/:landmarkId`
Generate QR code for a specific landmark.

**Response:**
```json
{
  "landmarkId": "ESB",
  "name": "Empire State Building",
  "zone": "Midtown",
  "qrData": "QFIND|ESB|a1b2c3d4...",
  "hash": "a1b2c3d4e5f6...",
  "expiresIn": 45,
  "window": 12345678
}
```

#### `POST /api/qr/validate`
Validate a scanned QR hash.

**Request:**
```json
{
  "hash": "a1b2c3d4e5f6...",
  "landmarkId": "ESB",
  "teamId": "TEAM_ALPHA"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Check-in confirmed at Empire State Building",
  "landmark": { "id": "ESB", "name": "Empire State Building", "zone": "Midtown" }
}
```

### Qubit Endpoints

#### `GET /api/qubit/:teamId`
Get team's current qubit state.

**Response:**
```json
{
  "teamId": "TEAM_ALPHA",
  "stability": 67.5,
  "locked": false,
  "idleTime": 120,
  "gamma": 0.02,
  "checkpoints": 3
}
```

#### `POST /api/qubit/checkin`
Record a check-in and update stability.

**Request:**
```json
{
  "teamId": "TEAM_ALPHA",
  "landmarkId": "ESB",
  "position": { "lat": 40.7484, "lng": -73.9857 }
}
```

#### `GET /api/qubit/puzzle/random`
Get a random error correction puzzle.

#### `POST /api/qubit/puzzle/validate`
Validate puzzle answer and restore qubit.

### Admin Endpoints (Protected)

All admin endpoints require `adminPassword: "quantum2026"` in request body.

- `POST /api/admin/reset-team` - Reset specific team
- `POST /api/admin/unlock-team` - Force unlock team
- `POST /api/admin/set-stability` - Manually set stability
- `POST /api/admin/delete-team` - Delete team
- `POST /api/admin/reset-all` - Reset all teams
- `GET /api/admin/stats` - Get system statistics

### WebSocket Events

**Client → Server:**
- `SUBSCRIBE` - Subscribe to team updates
- `PING` - Heartbeat
- `REQUEST_STATE` - Request current state

**Server → Client:**
- `CONNECTED` - Connection established
- `QUBIT_UPDATE` - Team state update (every 5s)
- `ALL_TEAMS_UPDATE` - All teams state
- `PONG` - Heartbeat response

---

## 🎨 Customization

### Change Decoherence Rate
Edit `server/qubit/engine.js`:
```js
const GAMMA = 0.02; // Increase for faster decay
```

### Add New Landmarks
Edit `shared/landmarks-extended.js`:
```js
{
  id: "NEWL",
  name: "New Landmark",
  zone: "Manhattan",
  lat: 40.7589,
  lng: -73.9851,
  secret: "NEWL_SECRET_KEY",
  hint: "Your hint here",
  points: 100,
}
```

### Add New Puzzle
Edit `shared/puzzles.js`:
```js
{
  id: 9,
  question: "Your quantum question?",
  options: ["A", "B", "C", "D"],
  correctIndex: 2,
  explanation: "Why C is correct"
}
```

### Change Admin Password
Edit `server/routes/admin.js`:
```js
const ADMIN_PASSWORD = "your_new_password";
```

### Customize Sound Effects
Edit `client/src/utils/sounds.js` to change frequencies/durations.

### Theme Colors
Edit CSS custom properties in `client/src/App.css`:
```css
:root {
  --bg-primary: #020409;
  --accent-cyan: #00f5d4;
  --accent-purple: #9b5de5;
  --accent-yellow: #fee440;
  --accent-red: #ff4d6d;
}
```

---

## 🐛 Troubleshooting

### QR Scanner Not Working
- **Camera permissions:** Browser must allow camera access
- **HTTPS required:** Use `http://YOUR_IP:5173` on same network, or deploy with SSL
- **Phone compatibility:** Requires `getUserMedia` API support

### WebSocket Connection Failed
- Check backend is running on port 3000
- Verify IP address matches in all files
- Check firewall allows WebSocket connections
- Mobile users: Must be on same WiFi network

### Stability Not Decaying
- Check server console for "Qubit Tick" messages every 5s
- Verify team state is initialized (make a check-in first)
- Check `gamma` value in team state

### GPS Not Tracking
- Browser must support Geolocation API
- User must grant location permissions
- Accuracy improves outdoors with clear sky
- Mobile data/WiFi helps with initial lock

---

## 📊 Performance

### Metrics
- **QR Generation:** <50ms per hash
- **Validation:** <20ms per request
- **WebSocket latency:** <100ms
- **GPS accuracy:** ±10-50m (device-dependent)
- **Concurrent teams:** Tested up to 50

### Optimization Tips
- Use Redis for team state (production)
- Enable gzip compression
- CDN for static assets
- Rate limiting on API endpoints
- Database for checkpoint history

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

### Quick Deploy

**Frontend (Vercel):** [https://q-find-five.vercel.app/](https://q-find-five.vercel.app/)
```bash
cd client
vercel --prod
```

**Backend (Render):** [https://q-find-backend.onrender.com/](https://q-find-backend.onrender.com/)
```bash
railway login
railway init
railway up
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Use Prettier for formatting
- ESLint for linting
- Commit messages: Conventional Commits format

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **Hack Club** - For organizing The Game
- **Anthropic Claude** - AI pair programming partner(Used for jsx files and Readme)
- **Research Paper** - Wave Mechanics decay model (Zenodo)
- **NYC Landmarks** - Public domain landmark data

---

## 📞 Contact

**Project Maintainer:** Rishav Jha  
**GitHub:** [@rishavjha8515-hub](https://github.com/rishavjha8515-hub)  
**Project Link:** [Q-find](https://github.com/rishavjha8515-hub/Q-find)

---

## 📈 Development Stats

- **Total Hours:** 40+ hours logged
- **Lines of Code:** ~8,000+
- **Components:** 15+ React components
- **API Endpoints:** 12+
- **Landmarks:** 20 NYC locations
- **Achievements:** 10 milestones

---

## 🗓️ Roadmap

- [ ] Database integration (PostgreSQL)
- [ ] User authentication (JWT)
- [ ] Team chat feature
- [ ] Photo uploads at landmarks
- [ ] Route optimization algorithm
- [ ] Mobile app (React Native)
- [ ] Multi-city support
- [ ] Historical replay feature

---

**Built with ⚛️ quantum mechanics and ❤️ for Hack Club: The Game**

*May the qubits be ever in your favor.*
