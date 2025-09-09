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
export const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${message}`, data);
    // In production, send to monitoring service
  },
  
  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
    // In production, send to error tracking service
    // Could integrate with Vercel Analytics or Sentry
  },
  
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

### 3. Performance Monitoring
```javascript
// src/utils/analytics.js
export const trackEvent = (eventName, properties = {}) => {
  // Basic analytics tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

export const trackAPICall = async (apiName, operation) => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    logger.info(`API Call: ${apiName}`, { duration, success: true });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`API Call Failed: ${apiName}`, { duration, error: error.message });
    throw error;
  }
};
```

## Backup & Recovery

### 1. Data Backup Strategy
```bash
# Create backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

mkdir -p $BACKUP_DIR

# Backup data files
cp data/*.json $BACKUP_DIR/
cp config/*.json $BACKUP_DIR/

# Create compressed archive
tar -czf "backup_$DATE.tar.gz" $BACKUP_DIR

echo "Backup completed: backup_$DATE.tar.gz"
```

### 2. Recovery Procedures
```bash
# Restore from backup
#!/bin/bash
# restore.sh

if [ $# -eq 0 ]; then
    echo "Usage: ./restore.sh backup_YYYYMMDD_HHMMSS.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
TEMP_DIR="temp_restore"

# Extract backup
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restore files
cp $TEMP_DIR/*/data/*.json data/
cp $TEMP_DIR/*/config/*.json config/

# Cleanup
rm -rf $TEMP_DIR

echo "Restore completed from $BACKUP_FILE"
```

### 3. Disaster Recovery Plan
1. **Data Loss**: Restore from most recent backup
2. **API Failure**: Fall back to cached data and manual updates
3. **Hosting Issues**: Redeploy to new Vercel project
4. **Domain Issues**: Update DNS to point to Vercel subdomain

## Security Considerations

### 1. API Security
```javascript
// src/middleware/auth.js
export function validateAPIKey(request) {
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.INTERNAL_API_KEY;
  
  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
```

### 2. Rate Limiting
```javascript
// src/utils/rateLimiter.js
const rateLimiter = new Map();

export function checkRateLimit(ip, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, []);
  }
  
  const requests = rateLimiter.get(ip);
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimiter.set(ip, validRequests);
  return true;
}
```

### 3. Input Validation
```javascript
// src/utils/validation.js
export const schemas = {
  playerConfig: {
    name: (value) => typeof value === 'string' && value.length > 0,
    teams: (value) => Array.isArray(value) && value.length === 4
  },
  
  gameResult: {
    team: (value) => /^[A-Z]{2,3}$/.test(value),
    wins: (value) => Number.isInteger(value) && value >= 0,
    losses: (value) => Number.isInteger(value) && value >= 0
  }
};

export function validateData(data, schema) {
  for (const [key, validator] of Object.entries(schema)) {
    if (!validator(data[key])) {
      throw new Error(`Invalid ${key}: ${data[key]}`);
    }
  }
  return true;
}
```

## Optimization Checklist

### Pre-Launch
- [ ] All API keys configured and tested
- [ ] Player configuration file completed
- [ ] Team logos downloaded and optimized
- [ ] Mobile responsiveness tested on multiple devices
- [ ] Performance audit completed (Lighthouse score > 90)
- [ ] Error handling tested with API failures
- [ ] Social sharing graphics generation tested
- [ ] Achievement system functioning correctly

### Post-Launch Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerting
- [ ] Monitor API usage and costs
- [ ] Track user engagement metrics
- [ ] Regular data backups scheduled
- [ ] Performance metrics reviewed weekly

## Troubleshooting Guide

### Common Issues

**1. Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check

# Verify environment variables
node -e "console.log(process.env.NFL_API_KEY ? 'API key found' : 'API key missing')"
```

**2. API Connection Issues**
```bash
# Test API endpoints manually
curl -X GET "http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"

# Check environment variables in Vercel
vercel env ls
```

**3. Data Update Failures**
```bash
# Manual data update
curl -X GET "https://your-domain.com/api/update-scores"

# Check logs in Vercel dashboard
vercel logs
```

**4. Performance Issues**
```bash
# Analyze bundle size
npx @next/bundle-analyzer

# Check for memory leaks
node --inspect src/scripts/update-scores.js
```

### Support Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **ESPN API Documentation**: http://www.espn.com/apis/devcenter/docs/
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs

## Deployment Checklist

### Before First Deploy
- [ ] GitHub repository created and connected
- [ ] All environment variables configured
- [ ] Player configuration file completed
- [ ] Dependencies installed and tested locally
- [ ] Build process successful locally

### Vercel Configuration
- [ ] Project imported from GitHub
- [ ] Environment variables set in Vercel dashboard
- [ ] Custom domain configured (if applicable)
- [ ] Cron jobs configured for automated updates
- [ ] Build and deployment settings optimized

### Post-Deploy Verification
- [ ] Website accessible at deployed URL
- [ ] All pages load without errors
- [ ] API endpoints respond correctly
- [ ] Mobile experience tested
- [ ] Social sharing functionality works
- [ ] Data updates trigger correctly

### Go-Live Preparation
- [ ] Final player data verified
- [ ] Initial NFL data populated
- [ ] Achievement system tested
- [ ] Error handling verified
- [ ] Backup systems in place
- [ ] Monitoring configured
- [ ] Documentation completed

## Maintenance Schedule

### Daily
- Monitor error logs and API status
- Verify automated data updates are working

### Weekly
- Review performance metrics
- Check API usage and costs
- Backup data files
- Test all major functionality

### Monthly
- Update dependencies
- Review security settings
- Analyze user engagement
- Optimize performance based on metrics

### Seasonal
- Prepare for NFL season start/end
- Update team rosters and logos
- Review and update achievement criteria
- Plan feature enhancements for next season

This comprehensive deployment guide should enable you to successfully launch and maintain the Fantasy NFL Dashboard. The modular approach allows for incremental deployment and testing of individual features.