# Deployment Guide

## Prerequisites

### Required Accounts & Services
1. **Vercel Account** - For hosting the application
2. **GitHub Account** - For code repository and continuous deployment
3. **Domain Registrar** - For custom domain (optional but recommended)
4. **API Keys**:
   - ESPN API (free tier available)
   - The Odds API (betting data)
   - Grok API (X.ai platform)

### Development Environment
```bash
# Required versions
Node.js >= 18.0.0
npm >= 9.0.0

# Recommended tools
Git
VS Code or similar editor
```

## Initial Setup

### 1. Repository Creation
```bash
# Create new Next.js project
npx create-next-app@latest fantasy-nfl-dashboard --typescript --tailwind --eslint --app
cd fantasy-nfl-dashboard

# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/your-username/fantasy-nfl-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Project Structure Setup
```bash
# Create required directories
mkdir -p config data public/team-logos public/achievement-icons src/components src/utils

# Create initial config files
touch config/players.json
touch data/results.json data/history.json data/achievements.json data/narratives.json

# Create component files
touch src/components/Leaderboards.js
touch src/components/PlayerCards.js
touch src/components/HistoricalCharts.js
touch src/components/WeeklyNarrative.js
touch src/components/AchievementBadges.js
touch src/components/SocialShare.js

# Create utility files
touch src/utils/nflApi.js
touch src/utils/calculations.js
touch src/utils/achievements.js
touch src/utils/imageGenerator.js
```

### 3. Environment Variables Setup
Create `.env.local` file:
```bash
# API Keys
NFL_API_KEY=your_espn_api_key_here
ODDS_API_KEY=your_odds_api_key_here
GROK_API_KEY=your_grok_api_key_here

# Configuration
NEXT_PUBLIC_LEAGUE_NAME="Football Winners and Jets"
NEXT_PUBLIC_SEASON_YEAR="2025"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Development
NODE_ENV=development
```

Create `.env.example` file for reference:
```bash
# Copy this to .env.local and fill in your API keys
NFL_API_KEY=
ODDS_API_KEY=
GROK_API_KEY=
NEXT_PUBLIC_LEAGUE_NAME="Football Winners and Jets"
NEXT_PUBLIC_SEASON_YEAR="2025"
NEXT_PUBLIC_APP_URL=
```

## Dependencies Installation

### Core Dependencies
```bash
npm install next@latest react@latest react-dom@latest

# UI and Styling
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npm install @headlessui/react @heroicons/react

# Charts and Visualization
npm install recharts lucide-react

# Image Generation and Processing
npm install sharp canvas

# Utilities
npm install axios date-fns lodash

# Development Dependencies
npm install --save-dev @types/node @types/react @types/react-dom typescript eslint eslint-config-next prettier
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "update-scores": "node scripts/update-scores.js",
    "generate-narrative": "node scripts/generate-narrative.js"
  }
}
```

## Vercel Deployment

### 1. Connect GitHub Repository
1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `fantasy-nfl-dashboard`

### 2. Configure Build Settings
```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/*/route.js": {
      "maxDuration": 30
    }
  }
}
```

### 3. Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables:
```
NFL_API_KEY=your_api_key_here
ODDS_API_KEY=your_api_key_here
GROK_API_KEY=your_api_key_here
NEXT_PUBLIC_LEAGUE_NAME=Football Winners and Jets
NEXT_PUBLIC_SEASON_YEAR=2025
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Custom Domain Setup
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records with your domain registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Data Initialization

### 1. Create Player Configuration
Edit `config/players.json`:
```json
{
  "leagueName": "Football Winners and Jets",
  "season": "2025",
  "seasonStart": "2025-09-04",
  "seasonEnd": "2025-12-29",
  "players": {
    "player1": {
      "name": "Player Name Here",
      "teams": ["KC", "BUF", "MIA", "NYJ"],
      "joinDate": "2025-08-01"
    }
  }
}
```

### 2. Initialize Data Files
```bash
# Initialize empty data structures
echo '{"lastUpdated": null, "currentWeek": 0, "teams": {}}' > data/results.json
echo '{"weeks": {}}' > data/history.json
echo '{"achievements": {}, "playerAchievements": {}}' > data/achievements.json
echo '{"narratives": {}}' > data/narratives.json
```

### 3. Download Team Assets
```bash
# Create script to download NFL team logos
mkdir -p public/team-logos

# Download all 32 team logos from ESPN
curl -o public/team-logos/KC.png "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"
curl -o public/team-logos/BUF.png "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png"
# ... continue for all teams
```

## Automated Updates Setup

### 1. Vercel Cron Jobs
Create `vercel.json` with cron configuration:
```json
{
  "crons": [
    {
      "path": "/api/update-scores",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/generate-narrative",
      "schedule": "0 2 * * 1"
    }
  ]
}
```

### 2. Manual Update Endpoints
Create API routes for manual triggers:
- `GET /api/update-scores` - Force NFL data refresh
- `GET /api/generate-narrative` - Generate new weekly narrative
- `GET /api/health-check` - System status monitoring

### 3. Webhook Integration (Optional)
Set up webhooks for real-time updates:
```javascript
// src/app/api/webhook/route.js
export async function POST(request) {
  const payload = await request.json();
  
  // Verify webhook signature
  // Update relevant data
  // Trigger regeneration
  
  return Response.json({ success: true });
}
```

## Monitoring & Maintenance

### 1. Health Monitoring
```javascript
// src/app/api/health/route.js
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    apis: {
      nfl: await checkNFLAPI(),
      odds: await checkOddsAPI(),
      grok: await checkGrokAPI()
    }
  };
  
  return Response.json(health);
}
```

### 2. Error Logging
```javascript
// src/utils/logger.js
export