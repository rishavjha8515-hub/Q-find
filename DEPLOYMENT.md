# 🚀 Q-Find Deployment Guide

Complete guide to deploying Q-Find to production for Hack Club: The Game (Manhattan, May 2026).

---

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] API URLs updated for production
- [ ] Admin password changed from default
- [ ] Git repository up to date
- [ ] Dependencies audit clean (`npm audit`)
- [ ] Build succeeds without errors

### Infrastructure
- [ ] Domain name registered (optional but recommended)
- [ ] SSL certificate (automatic with Vercel/Railway)
- [ ] Database provisioned (if using PostgreSQL)
- [ ] CDN configured (optional)

---

## 🎯 Current Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [https://q-find-five.vercel.app](https://q-find-five.vercel.app) |
| Backend | Render (free tier) | [https://q-find-backend.onrender.com](https://q-find-backend.onrender.com) |

> ⚠️ **Free tier note:** Render spins down after 15 minutes of inactivity. First request may take 30–60 seconds to wake up.

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────┐
│   Vercel                        │
│   q-find-five.vercel.app        │  ← React Frontend (Static)
│   (Frontend)                    │
└────────────────┬────────────────┘
                 │
                 │ HTTPS/WSS
                 │
                 ▼
┌─────────────────────────────────┐
│   Render (Free Tier)            │
│   q-find-backend.onrender.com   │  ← Node.js Backend + WebSocket
│   (Backend)                     │
└─────────────────────────────────┘
```

---

## 🌐 Option 1: Vercel (Frontend) + Railway (Backend)

**Recommended for Hack Club: The Game**

### Step 1: Deploy Backend to Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize project**
```bash
cd Q-FIND
railway init
# Choose: "Create new project"
# Name: "q-find-backend"
```

4. **Create environment variables**
```bash
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set ADMIN_PASSWORD=your_secure_password_here
```

5. **Deploy**
```bash
railway up
```

6. **Get deployment URL**
```bash
railway status
# Copy the URL (e.g., https://q-find-backend.onrender.com)
```

7. **Enable WebSocket support**

Railway automatically supports WebSockets! No extra config needed.

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Update API URLs**

Edit these files and replace `http://192.168.X.X:3000` with your Railway URL:

```bash
# Update all of these:
client/src/App.jsx
client/src/components/Scanner.jsx
client/src/components/QubitStatus.jsx
client/src/components/PuzzleModal.jsx
client/src/components/TeamDashboard.jsx
client/src/components/Analytics.jsx
client/src/components/AdminPanel.jsx
client/src/hooks/useWebSocket.js
```

**Example:**
```js
const API = "https://q-find-backend.onrender.com";
const WS_URL = "wss://q-find-backend.up.railway.app/ws";
```

3. **Build and deploy**
```bash
cd client
vercel --prod
```

4. **Configure build settings** (if prompted)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

5. **Get deployment URL**
```
✓ Production: https://q-find-five.vercel.app
```

### Step 3: Configure CORS

Update `server/index.js`:

```js
app.use(cors({
  origin: [
    "https://q-find-five.vercel.app",
    "http://localhost:5173" // Keep for local dev
  ],
  credentials: true
}));
```

Redeploy backend:
```bash
railway up
```

### Step 4: Test Production

1. Visit your Vercel URL: `https://q-find-five.vercel.app`
2. Test QR generation
3. Test scanner on phone
4. Check WebSocket connection in Analytics tab
5. Verify admin panel works

---

## 🔄 Option 2: Render (Full Stack)

**Single platform for both frontend and backend**

### Step 1: Prepare Repository

1. **Create `render.yaml`** in project root:

```yaml
services:
  # Backend
  - type: web
    name: q-find-backend
    env: node
    buildCommand: npm install
    startCommand: node server/index.js
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
      - key: ADMIN_PASSWORD
        generateValue: true

  # Frontend
  - type: web
    name: q-find-frontend
    env: static
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/dist
    envVars:
      - key: VITE_API_URL
        fromService:
          name: q-find-backend
          type: web
          property: host
```

2. **Push to GitHub**
```bash
git add .
git commit -m "Add Render deployment config"
git push
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Click "Apply"

### Step 3: Get URLs

After deployment:
- Backend: `https://q-find-backend.onrender.com`
- Frontend: `https://q-find-five.vercel.app`

Update frontend API URLs with backend URL and redeploy.

---

## 🐳 Option 3: Docker + Any Host

**For VPS, DigitalOcean, AWS, etc.**

### Step 1: Create Dockerfiles

**Backend Dockerfile** (`Dockerfile.backend`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY server/ ./server/
COPY shared/ ./shared/

RUN npm install --production

EXPOSE 3000

CMD ["node", "server/index.js"]
```

**Frontend Dockerfile** (`Dockerfile.frontend`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Step 3: Deploy

```bash
# Set environment variables
export ADMIN_PASSWORD=your_secure_password

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## 🔒 Security Hardening

### Change Default Passwords

1. **Admin password** in `server/routes/admin.js`:
```js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "quantum2026";
```

Set via environment variable:
```bash
railway variables set ADMIN_PASSWORD=super_secret_password_2026
```

2. **Landmark secrets** in `shared/landmarks-extended.js`:

Generate new secrets:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Enable Rate Limiting

Install package:
```bash
npm install express-rate-limit
```

Update `server/index.js`:
```js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

### HTTPS Only

Force HTTPS in `server/index.js`:
```js
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### Environment Variables

Never commit `.env` files! Use platform-specific secrets:

**Railway:**
```bash
railway variables set KEY=value
```

**Vercel:**
```bash
vercel env add KEY
```

**Render:**
Add in dashboard: Settings → Environment

---

## 📊 Monitoring & Logging

### Railway Logging

View logs in real-time:
```bash
railway logs
```

### Vercel Logging

View deployment logs:
```bash
vercel logs
```

### Add Application Logging

Install Winston:
```bash
npm install winston
```

Create `server/logger.js`:
```js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

Use in code:
```js
const logger = require('./logger');

logger.info('Team checked in', { teamId, landmarkId });
logger.error('Validation failed', { error });
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd client && npm install
      - run: cd client && npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Add secrets in GitHub:
- Settings → Secrets → Actions
- Add `RAILWAY_TOKEN` and `VERCEL_TOKEN`

---

## 📱 PWA Setup (Optional)

Make Q-Find installable on phones!

### Step 1: Create manifest.json

`client/public/manifest.json`:
```json
{
  "name": "Q-Find: Quantum Scavenger Hunt",
  "short_name": "Q-Find",
  "description": "GPS-based scavenger hunt with quantum mechanics",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020409",
  "theme_color": "#00f5d4",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Step 2: Add to index.html

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#00f5d4">
```

### Step 3: Create icons

Generate icons at [favicon.io](https://favicon.io) or use ImageMagick:
```bash
convert logo.png -resize 192x192 public/icon-192.png
convert logo.png -resize 512x512 public/icon-512.png
```

---

## 🧪 Testing Production

### Checklist

- [ ] QR codes generate correctly
- [ ] Scanner validates hashes
- [ ] Qubit decay works (wait 30s, check stability drops)
- [ ] WebSocket connects (green dot in Analytics)
- [ ] GPS tracking works on phone
- [ ] Puzzle modal appears when locked
- [ ] Admin panel requires password
- [ ] Leaderboard updates in real-time
- [ ] Sound effects play
- [ ] Settings persist after refresh
- [ ] Mobile responsive (test on phone)
- [ ] HTTPS works (no mixed content warnings)

### Load Testing

Use Apache Bench:
```bash
ab -n 1000 -c 10 https://your-backend.railway.app/api/health
```

Or Artillery:
```bash
npm install -g artillery
artillery quick --count 100 --num 10 https://your-backend.railway.app/api/health
```

---

## 🚨 Troubleshooting Production

### WebSocket Connection Failed

**Symptom:** Analytics shows "Disconnected"

**Fix:**
1. Check WebSocket URL uses `wss://` (not `ws://`)
2. Verify backend allows WebSocket upgrade
3. Check firewall/load balancer settings
4. Railway: WebSockets work automatically
5. Render: Requires paid plan for WebSockets

### CORS Errors

**Symptom:** "Access-Control-Allow-Origin" error

**Fix:**
Update `server/index.js`:
```js
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
  ],
  credentials: true
}));
```

Set environment variable:
```bash
railway variables set FRONTEND_URL=https://q-find-five.vercel.app
```

### GPS Not Working on HTTPS

**Symptom:** Camera/GPS blocked

**Fix:**
1. Ensure site is served over HTTPS
2. Check browser permissions
3. iOS: Requires user gesture to request permissions
4. Android: Works in Chrome, may fail in other browsers

### High Memory Usage

**Symptom:** Backend crashes with OOM error

**Fix:**
1. Switch from in-memory to Redis for team state
2. Limit concurrent WebSocket connections
3. Add memory limit in Railway:
   ```bash
   railway variables set RAILWAY_MEMORY_LIMIT=512
   ```

---

## 💰 Cost Estimation

### Free Tier (Hobby Projects)

**Vercel:**
- ✅ Free for personal projects
- ✅ Unlimited bandwidth
- ✅ Automatic SSL

**Railway:**
- ✅ $5 free credit/month
- ✅ ~500 hours of uptime
- ✅ Enough for Hack Club event (3 days)

**Total:** $0-5/month

### Paid Tier (Production)

**Vercel Pro:** $20/month
**Railway Pro:** $20/month
**Total:** $40/month

For Hack Club event (3 days): ~$4 total

---

## 📅 Pre-Event Deployment Timeline

**2 Weeks Before:**
- Deploy to production
- Run load tests
- Fix any issues

**1 Week Before:**
- Final code freeze
- Security audit
- Backup plan ready

**3 Days Before:**
- Monitor uptime
- Check all features
- Team walkthrough

**Event Day:**
- Monitor dashboard
- Have admin credentials ready
- Phone charged for hotspot backup

---

## 🆘 Emergency Procedures

### If Backend Goes Down

1. **Check Railway status:** https://railway.app/status
2. **Restart service:**
   ```bash
   railway restart
   ```
3. **Roll back:**
   ```bash
   railway rollback
   ```
4. **Fallback:** Switch to backup Render deployment

### If Frontend Goes Down

1. **Check Vercel status:** https://vercel.com/status
2. **Redeploy:**
   ```bash
   vercel --prod
   ```
3. **Fallback:** Serve from backup Netlify deployment

### Database Corruption (if using persistence)

1. **Export current state:**
   ```bash
   railway run -- node scripts/export-state.js
   ```
2. **Reset database**
3. **Import backup:**
   ```bash
   railway run -- node scripts/import-state.js
   ```

---

## 📞 Support

**During Event:**
- Monitor: `railway logs -f`
- Admin panel: Quick fixes
- Hotline: Your phone number

**After Event:**
- GitHub Issues: Bug reports
- Email: Contact maintainer

---

**You're ready to deploy! 🚀 May the qubits be with you!**
