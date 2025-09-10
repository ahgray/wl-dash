# Fantasy NFL Dashboard - Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository with this code
- Grok API key (optional, for AI narratives)

### Quick Deploy
1. **Connect to Vercel**:
   ```bash
   npx vercel
   ```

2. **Environment Variables**:
   Set up the following environment variables in your Vercel dashboard:
   ```
   GROK_API_KEY=your_grok_api_key_here
   NFL_API_KEY=optional_nfl_api_key
   ODDS_API_KEY=optional_odds_api_key
   NEXT_PUBLIC_LEAGUE_NAME="Football Winners and Jets"
   NEXT_PUBLIC_SEASON_YEAR="2025"
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Automated Deployment

#### GitHub Integration
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables
4. Deploy automatically on every push

#### Environment Variables Setup

**Required:**
- `NEXT_PUBLIC_LEAGUE_NAME`: Your league name
- `NEXT_PUBLIC_SEASON_YEAR`: Current season year

**Optional:**
- `GROK_API_KEY`: For AI-generated weekly narratives
- `NFL_API_KEY`: For enhanced NFL data (currently not required)
- `ODDS_API_KEY`: For betting odds integration (future feature)

### Features in Production

#### Automatic Data Refresh
- NFL data cached for 30 minutes
- Achievement calculations cached for 15 minutes
- Scheduled refresh every 2 hours via cron job

#### API Endpoints
- `/api/data/results` - Live NFL team data
- `/api/data/achievements` - Player achievements
- `/api/data/narratives` - Weekly narratives
- `/api/cache/stats` - Cache performance metrics
- `/api/cache/refresh` - Manual cache refresh

#### Performance Optimizations
- In-memory caching for API responses
- Fallback to static data if APIs fail
- Optimized for mobile devices
- Glassmorphism design with smooth animations

### Manual Configuration

#### Player Configuration
Edit `config/players.json` to set up your league:
```json
{
  "leagueName": "Your League Name",
  "season": 2025,
  "players": {
    "player1": {
      "name": "Player One",
      "teams": ["KC", "BUF", "SF", "PHI"]
    }
  }
}
```

#### Data Management
- `data/results.json` - Sample NFL data (auto-replaced with live data)
- `data/achievements.json` - Achievement state (auto-generated)
- `data/narratives.json` - Weekly narratives (auto-generated)

### Monitoring & Maintenance

#### Cache Management
- View cache statistics: `/api/cache/stats`
- Clear cache: `POST /api/cache/stats` with `{"action": "clear"}`
- Manual refresh: `/api/cache/refresh`

#### Performance Monitoring
Check Vercel dashboard for:
- Function execution times
- Memory usage
- Error rates
- Cache hit rates

### Troubleshooting

#### Common Issues
1. **API Rate Limits**: ESPN API may rate limit requests
   - Solution: Increase cache TTL in production

2. **Cold Start Delays**: First request after inactivity may be slow
   - Solution: Use Vercel Pro for faster cold starts

3. **Memory Usage**: Large data sets may cause memory issues
   - Solution: Implement database storage for historical data

4. **Missing Environment Variables**:
   ```bash
   vercel env add GROK_API_KEY
   ```

#### Debug Mode
Enable debug logging by setting:
```
DEBUG=1
NODE_ENV=development
```

### Custom Domain
1. Go to Vercel dashboard > Project Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Analytics
Vercel provides built-in analytics for:
- Page views
- User sessions
- Performance metrics
- Core Web Vitals

Access via Vercel Dashboard > Analytics tab.

## Alternative Deployment Options

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Hosting
1. Build the application: `npm run build`
2. Copy `.next`, `public`, and `package.json` to server
3. Install dependencies: `npm ci --only=production`
4. Start: `npm start`

## Security Considerations
- Environment variables are server-side only
- No sensitive data in client-side code
- HTTPS enforced in production
- Rate limiting on API endpoints
- Input validation on all user data

## Support
For deployment issues, check:
1. Vercel deployment logs
2. Browser console for client errors
3. `/api/cache/stats` for system health
4. GitHub Issues for known problems