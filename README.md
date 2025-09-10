# Winners Losers and the Jets Dashboard

A real-time fantasy NFL dashboard where 8 players compete in both wins and losses competitions throughout the 2025 NFL season. Each player selects 4 teams and tracks their performance with advanced analytics, Monte Carlo simulations, and achievement tracking.

## 🏆 Features

- **Real-time NFL Data**: Live scores and standings via ESPN API
- **Dual Competition**: Track both wins and losses leaderboards
- **Monte Carlo Simulations**: Season outcome probability predictions
- **Achievement System**: 12 unique badges with rarity tiers
- **ELO Rating System**: Advanced team strength calculations
- **AI-Generated Narratives**: Weekly storylines and highlights
- **Responsive Design**: Optimized for desktop and mobile
- **Live Updates**: Automatic data refresh during game days

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ahgray/wl-dash.git
cd wl-dash

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

```
├── app/                    # Next.js 15 app directory
│   ├── page.tsx           # Main dashboard page
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── src/
│   ├── components/        # React components
│   │   ├── Leaderboards.tsx
│   │   ├── PlayerCards.tsx
│   │   ├── MonteCarlo.tsx
│   │   └── WeeklyNarrative.tsx
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
│       ├── nflApi.ts     # ESPN API integration
│       ├── calculations.ts # Monte Carlo & standings
│       ├── achievements.ts # Badge system
│       ├── cache.ts      # Data caching
│       └── narrativeGenerator.ts # AI content
├── config/
│   └── players.json      # League configuration
├── data/                 # Data files
│   ├── results.json      # Current NFL results
│   ├── achievements.json # Achievement tracking
│   ├── narratives.json   # Weekly stories
│   └── history.json      # Season history
└── docs/                 # Documentation
```

## ⚙️ Configuration

### League Setup

Edit `config/players.json` to configure your league:

```json
{
  "leagueName": "Your League Name",
  "season": "2025",
  "seasonStart": "2025-09-04",
  "seasonEnd": "2025-12-29",
  "playoffStart": "2025-01-04",
  "superbowl": "2025-02-09",
  "players": {
    "player_id": {
      "name": "Player Name",
      "teams": ["DAL", "SF", "BUF", "KC"],
      "joinDate": "2025-08-01"
    }
  }
}
```

### Environment Variables

Create `.env.local`:

```bash
# Optional: OpenAI API key for narrative generation
OPENAI_API_KEY=your_openai_key_here

# Optional: Custom ESPN API endpoints
NEXT_PUBLIC_ESPN_API_BASE=https://site.api.espn.com/apis/site/v2/sports/football/nfl
```

## 🎮 How It Works

### Competition Format

- **8 Players** each select **4 NFL teams** at season start
- **Wins Competition**: Most team wins across your 4 teams
- **Losses Competition**: Most team losses across your 4 teams (yes, this is intentional!)
- Real-time tracking throughout the 18-week NFL regular season

### Scoring System

- Each NFL game result (W/L/T) adds to your total
- Win percentage calculated: `wins / (wins + losses + ties)`
- Rankings updated after each completed game
- ELO ratings factor into probability calculations

### Monte Carlo Simulations

Advanced probability engine running 1000+ season simulations:

- **Regression to Mean**: Early season predictions weighted toward 50% league average
- **ELO Adjustments**: Team strength factors into win probability
- **Random Variance**: ±5% game-by-game uncertainty
- **Confidence Intervals**: Min/max possible outcomes
- **Magic Numbers**: Wins needed to guarantee championships

## 🏅 Achievement System

12 unique achievements across 5 rarity tiers:

- **🏆 Legendary**: Perfect Week, Total Domination
- **💜 Epic**: Disaster Week, Rivalry Master  
- **💚 Rare**: Comeback Kid, Win Streak, Loss Streak, Consistency King
- **💛 Uncommon**: Early Leader, Underdog Victory
- **⚪ Common**: First Victory, Balanced Portfolio

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Key Technologies

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.17
- **Charts**: Recharts 3.2.0
- **Icons**: Lucide React 0.543.0
- **HTTP Client**: Axios 1.11.0
- **AI**: OpenAI API 5.20.0

### Data Flow

1. **NFL API**: ESPN endpoints fetch live scores and standings
2. **Calculations**: Process team records into player standings
3. **Monte Carlo**: Run probability simulations for predictions
4. **Achievements**: Check for earned badges and milestones
5. **Narratives**: Generate AI-powered weekly storylines
6. **Cache**: Store results to minimize API calls
7. **UI**: Render real-time dashboard with live updates

### Caching Strategy

- **NFL Data**: 30 minutes during game days, 1 hour off-season
- **Calculations**: 5 minutes for standings and probabilities
- **Narratives**: 1 hour (expensive AI generation)
- **Achievements**: 10 minutes (frequent updates needed)

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy automatically on each push

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

## 📊 API Reference

### ESPN NFL API

- **Scoreboard**: `GET /scoreboard` - Current week games and scores
- **Standings**: `GET /standings` - Conference standings and records
- **Team Schedule**: `GET /teams/{id}/schedule` - Individual team schedules

### Data Models

See `src/types/index.ts` for complete TypeScript definitions:

- `LeagueConfig` - League and player configuration
- `TeamRecord` - NFL team statistics and ELO ratings
- `PlayerStanding` - Player rankings and win percentages
- `ProbabilityModel` - Monte Carlo simulation results
- `Achievement` - Badge definitions and holders

## 🐛 Troubleshooting

### Common Issues

**Development server not updating?**
```bash
rm -rf .next && npm run dev
```

**TypeScript errors?**
```bash
npm run type-check
```

**Missing team logos?**
- Team logos load from ESPN CDN
- Fallback displays team abbreviations if images fail
- Check console for CORS or 404 errors

**Unrealistic probabilities?**
- Monte Carlo uses regression to mean for early season predictions
- Probabilities normalize as more games are played
- Check console logs for simulation debug output

### Environment Setup

**Node.js version issues:**
```bash
nvm use 18
# or
nvm install 18
```

**Package conflicts:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Run linting: `npm run lint`
5. Type check: `npm run type-check`
6. Commit: `git commit -m "Add feature"`
7. Push: `git push origin feature-name`
8. Create a Pull Request

## 📄 License

ISC License - see LICENSE file for details.

## 🙏 Acknowledgments

- ESPN API for real-time NFL data
- OpenAI for narrative generation
- Tailwind CSS for styling framework
- Recharts for data visualization
- Next.js team for the excellent framework

---

Built with ❤️ for fantasy football chaos and friendly competition. May the best (and worst) teams win! 🏈