# Development Guide

This guide covers common development scenarios, troubleshooting, and best practices for working on the Winners Losers and the Jets Dashboard.

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ (use `nvm` for version management)
- npm or yarn package manager
- Git for version control
- VS Code (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-username/wl-dash.git
cd wl-dash

# Install dependencies
npm install

# Start development server
npm run dev
```

Your development server will be available at `http://localhost:3000`.

### Environment Setup

Create `.env.local` for development:

```bash
# Optional: OpenAI API key for narrative generation
OPENAI_API_KEY=sk-your-openai-key-here

# Development mode enables debug logging
NODE_ENV=development

# Optional: Custom ESPN API base (for testing)
NEXT_PUBLIC_ESPN_API_BASE=https://site.api.espn.com/apis/site/v2/sports/football/nfl
```

## 🏗️ Architecture Overview

### Directory Structure

```
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout with providers
│   ├── globals.css        # Global styles and Tailwind
│   └── api/               # API routes (if needed)
├── src/
│   ├── components/        # React components
│   │   ├── Leaderboards.tsx    # Wins/losses leaderboards
│   │   ├── PlayerCards.tsx     # Player roster cards
│   │   ├── MonteCarlo.tsx      # Probability predictions
│   │   └── WeeklyNarrative.tsx # AI-generated stories
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # All interface definitions
│   └── utils/            # Business logic and utilities
│       ├── nflApi.ts     # ESPN API integration
│       ├── calculations.ts    # Monte Carlo & standings
│       ├── achievements.ts    # Badge system logic
│       ├── cache.ts      # Data caching utilities
│       └── narrativeGenerator.ts # AI content generation
├── config/
│   └── players.json      # League configuration
├── data/                 # Runtime data files
│   ├── results.json      # Current NFL results
│   ├── achievements.json # Achievement tracking
│   ├── narratives.json   # Weekly stories
│   └── history.json      # Season history
└── docs/                 # Documentation
```

### Data Flow

1. **NFL API** → Fetch live scores and standings
2. **Calculations** → Process into player standings
3. **Monte Carlo** → Generate season predictions
4. **Achievements** → Check for earned badges
5. **Narratives** → Create weekly stories
6. **Cache** → Store results to reduce API calls
7. **UI** → Render dashboard with real-time updates

## 🎨 Component Development

### Component Guidelines

1. **Use TypeScript**: All components should be strongly typed
2. **Functional Components**: Use React hooks, avoid class components
3. **Props Interface**: Define clear interfaces for all props
4. **Responsive Design**: Use Tailwind classes for mobile-first design
5. **Error Boundaries**: Handle errors gracefully

### Example Component Structure

```tsx
import React from 'react';
import { LeagueConfig, TeamRecord, PlayerStanding } from '@/types';

interface PlayerCardsProps {
  config: LeagueConfig;
  teams: Record<string, TeamRecord>;
  standings: PlayerStanding[];
  loading?: boolean;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({
  config,
  teams,
  standings,
  loading = false
}) => {
  // Component logic here
  
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container-constraint">
      {/* Component JSX */}
    </div>
  );
};

export default PlayerCards;
```

### Styling Conventions

We use Tailwind CSS with custom design system classes:

```css
/* Custom classes in globals.css */
.container-constraint {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.stat-card {
  @apply bg-card-bg border border-card-border rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200;
}

.player-card {
  @apply stat-card p-6 hover:bg-accent-bg/50;
}
```

Color system:
```css
:root {
  --neon-green: #10b981;
  --neon-blue: #3b82f6;
  --neon-purple: #8b5cf6;
  --neon-red: #ef4444;
  --neon-yellow: #f59e0b;
}
```

## 🔧 Common Development Tasks

### Adding a New Player

1. **Update Configuration**:
```json
// config/players.json
{
  "players": {
    "new_player_id": {
      "name": "New Player Name",
      "teams": ["KC", "SF", "BUF", "DAL"],
      "joinDate": "2025-08-01"
    }
  }
}
```

2. **Clear Cached Data**:
```bash
# Remove existing calculations
rm data/cached-results.json
rm data/achievements.json

# Restart dev server
npm run dev
```

### Adding a New Achievement

1. **Define Achievement**:
```typescript
// src/utils/achievements.ts
export const ACHIEVEMENTS = {
  new_achievement: {
    name: 'Achievement Name',
    description: 'Achievement description',
    icon: '🏆',
    rarity: 'rare' as const,
    check: (player, teams, standings, history) => {
      // Return true if player earned this achievement
      return checkCondition(player, teams);
    }
  }
};
```

2. **Update Achievement Types**:
```typescript
// src/types/index.ts - add to Achievement interface if needed
export interface Achievement {
  name: string;
  description: string;
  icon: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  holders: string[];
}
```

### Modifying Monte Carlo Algorithm

Key considerations when updating the simulation:

```typescript
// src/utils/calculations.ts
export function runMonteCarloSimulation(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  currentWeek: number,
  simulations: number = 1000
): Record<string, ProbabilityModel> {
  // Always validate inputs
  if (!config || !teams || currentWeek < 1 || currentWeek > 18) {
    throw new Error('Invalid simulation parameters');
  }

  // Consider performance implications
  if (simulations > 10000) {
    console.warn('High simulation count may impact performance');
  }

  // Your algorithm changes here...
}
```

### Creating API Routes (if needed)

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // API logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🐛 Common Issues and Solutions

### Development Server Issues

**Issue**: Changes not reflecting in browser

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Restart development server
npm run dev

# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
```

**Issue**: Port already in use

**Solutions**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### TypeScript Errors

**Issue**: Type errors after updating interfaces

**Solutions**:
```bash
# Run type checking
npm run type-check

# Common fixes
# 1. Update all usages of changed interface
# 2. Check import paths are correct
# 3. Ensure all required properties are provided
```

**Issue**: Module not found errors

**Solutions**:
```bash
# Check path aliases in tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Restart TypeScript server in VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Data and API Issues

**Issue**: ESPN API not returning data

**Solutions**:
```typescript
// Add error handling and fallbacks
try {
  const data = await fetchNFLData();
  return data;
} catch (error) {
  console.error('ESPN API failed:', error);
  
  // Use cached data as fallback
  const cachedData = await getCachedData();
  if (cachedData) {
    return { ...cachedData, isStale: true };
  }
  
  // Return mock data for development
  if (process.env.NODE_ENV === 'development') {
    return getMockData();
  }
  
  throw error;
}
```

**Issue**: Monte Carlo simulations returning NaN or unrealistic values

**Debug Steps**:
```typescript
// Add debug logging
console.log('Team data:', teams);
console.log('Current week:', currentWeek);
console.log('Remaining weeks:', remainingWeeks);

// Validate inputs
Object.entries(teams).forEach(([abbr, team]) => {
  if (team.wins < 0 || team.losses < 0) {
    console.error(`Invalid record for ${abbr}:`, team);
  }
  if (isNaN(team.winPct)) {
    console.error(`Invalid win percentage for ${abbr}:`, team.winPct);
  }
});
```

**Issue**: Team logos not displaying

**Solutions**:
```typescript
// Check logo URL generation
const logoUrl = getTeamLogo(teamAbbr);
console.log(`Logo URL for ${teamAbbr}:`, logoUrl);

// Verify team abbreviations match ESPN format
const validAbbreviations = Object.keys(TEAM_ID_MAP);
if (!validAbbreviations.includes(teamAbbr)) {
  console.error(`Unknown team abbreviation: ${teamAbbr}`);
}

// Handle missing logos gracefully
{logoUrl ? (
  <img src={logoUrl} alt={teamAbbr} onError={handleImageError} />
) : (
  <div className="fallback-logo">{teamAbbr}</div>
)}
```

### Styling Issues

**Issue**: Tailwind classes not working

**Solutions**:
```bash
# Check if Tailwind is running
npm run dev

# Verify tailwind.config.js includes all content paths
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}

# Clear Tailwind cache
rm -rf .next
```

**Issue**: Custom CSS not loading

**Solutions**:
```typescript
// Make sure globals.css is imported in layout.tsx
import './globals.css'

// Check CSS order (Tailwind should be first)
@tailwind base;
@tailwind components; 
@tailwind utilities;

/* Custom styles after Tailwind */
.custom-class {
  /* Your styles */
}
```

### Performance Issues

**Issue**: Slow Monte Carlo simulations

**Solutions**:
```typescript
// Reduce simulation count during development
const simCount = process.env.NODE_ENV === 'development' ? 100 : 1000;

// Add performance monitoring
console.time('Monte Carlo Simulation');
const results = runMonteCarloSimulation(config, teams, week, simCount);
console.timeEnd('Monte Carlo Simulation');

// Consider memoization for expensive calculations
const memoizedCalculation = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

**Issue**: Large bundle size

**Solutions**:
```bash
# Analyze bundle
npm run build
npm run analyze  # if you have bundle analyzer

# Common fixes:
# 1. Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

# 2. Tree-shake unused dependencies
# 3. Use Next.js Image component for images
import Image from 'next/image';
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- PlayerCards.test.tsx

# Run with coverage
npm test -- --coverage
```

### Writing Tests

Example component test:
```typescript
// __tests__/components/PlayerCards.test.tsx
import { render, screen } from '@testing-library/react';
import PlayerCards from '@/components/PlayerCards';
import { mockConfig, mockTeams, mockStandings } from '../fixtures';

describe('PlayerCards', () => {
  it('renders player information correctly', () => {
    render(
      <PlayerCards 
        config={mockConfig}
        teams={mockTeams}
        standings={mockStandings}
        achievements={null}
      />
    );

    expect(screen.getByText('Bony Tony')).toBeInTheDocument();
    expect(screen.getByText('2W - 1L')).toBeInTheDocument();
  });

  it('handles missing team data gracefully', () => {
    const incompleteTeams = { DAL: mockTeams.DAL }; // Missing other teams
    
    render(
      <PlayerCards 
        config={mockConfig}
        teams={incompleteTeams}
        standings={mockStandings}
        achievements={null}
      />
    );

    // Should not crash, should show fallback content
    expect(screen.getByText('0-0')).toBeInTheDocument();
  });
});
```

Example utility test:
```typescript
// __tests__/utils/calculations.test.ts
import { calculateStandings, runMonteCarloSimulation } from '@/utils/calculations';
import { mockConfig, mockTeams } from '../fixtures';

describe('calculations', () => {
  describe('calculateStandings', () => {
    it('calculates player standings correctly', () => {
      const { winsLeaderboard } = calculateStandings(mockConfig, mockTeams);
      
      expect(winsLeaderboard).toHaveLength(8);
      expect(winsLeaderboard[0].totalWins).toBeGreaterThanOrEqual(
        winsLeaderboard[1].totalWins
      );
    });
  });

  describe('runMonteCarloSimulation', () => {
    it('generates realistic probabilities', () => {
      const results = runMonteCarloSimulation(mockConfig, mockTeams, 5, 100);
      
      Object.values(results).forEach(result => {
        expect(result.winsCompetition.probabilityToWin).toBeBetween(0, 1);
        expect(result.lossesCompetition.probabilityToWin).toBeBetween(0, 1);
      });
    });
  });
});
```

### Test Fixtures

Create reusable mock data:
```typescript
// __tests__/fixtures/index.ts
export const mockConfig: LeagueConfig = {
  leagueName: 'Test League',
  season: '2025',
  seasonStart: '2025-09-04',
  seasonEnd: '2025-12-29',
  playoffStart: '2025-01-04',
  superbowl: '2025-02-09',
  players: {
    test_player: {
      name: 'Test Player',
      teams: ['DAL', 'SF', 'BUF', 'KC'],
      joinDate: '2025-08-01'
    }
  }
};

export const mockTeams: Record<string, TeamRecord> = {
  DAL: {
    name: 'Dallas Cowboys',
    abbreviation: 'DAL',
    wins: 2,
    losses: 1,
    ties: 0,
    winPct: 0.667,
    elo: 1550,
    previousElo: 1500,
    remainingSchedule: [],
    strengthOfSchedule: 0.5
  }
  // ... more teams
};
```

## 📊 Monitoring and Debugging

### Development Logging

Enable detailed logging in development:
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error);
  },
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG) {
      console.log(`🐛 ${message}`, data);
    }
  }
};

// Usage
logger.info('Fetching NFL data...');
logger.debug('Team records:', teams);
```

### Performance Monitoring

Track key metrics during development:
```typescript
// utils/performance.ts
export const perf = {
  start: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },
  end: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  }
};

// Usage
perf.start('Monte Carlo');
const results = runMonteCarloSimulation(config, teams, week);
perf.end('Monte Carlo');
```

### React DevTools

Recommended browser extensions for debugging:
- React Developer Tools
- Redux DevTools (if using Redux)
- Apollo Client DevTools (if using GraphQL)

## 🚀 Build and Deployment Preparation

### Pre-deployment Checklist

```bash
# 1. Run all checks
npm run type-check
npm run lint
npm test

# 2. Test production build locally
npm run build
npm run start

# 3. Test on different viewports
# - Desktop: 1920x1080
# - Tablet: 768x1024  
# - Mobile: 375x667

# 4. Verify data integrity
# - Check all player configurations
# - Validate team mappings
# - Test achievement calculations
# - Verify Monte Carlo results

# 5. Performance check
# - Lighthouse audit
# - Bundle size analysis
# - Memory usage profiling
```

### Environment Variables for Production

```bash
# Production .env
NODE_ENV=production
OPENAI_API_KEY=your-production-key
NEXT_PUBLIC_ESPN_API_BASE=https://site.api.espn.com/apis/site/v2/sports/football/nfl

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Error monitoring (optional) 
SENTRY_DSN=https://your-sentry-dsn
```

## 🤝 Contributing Guidelines

### Code Style

- Use Prettier for formatting (runs automatically on save)
- Follow ESLint rules (fix with `npm run lint -- --fix`)
- Use meaningful variable and function names
- Add TypeScript types for all functions and components
- Write JSDoc comments for complex functions

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit frequently
git add .
git commit -m "Add new feature component"

# Push and create PR
git push origin feature/new-feature
```

### Commit Message Format

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Test changes
- chore: Build/tooling changes

Examples:
feat(monte-carlo): add regression to mean algorithm
fix(logos): handle missing team logo URLs
docs(readme): update installation instructions
```

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Error handling is implemented
- [ ] Component is responsive
- [ ] Tests are added/updated
- [ ] Performance impact is considered
- [ ] Accessibility is maintained
- [ ] Documentation is updated

## 📚 Useful Resources

### Next.js 15
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### React & TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Testing
- [Testing Library Documentation](https://testing-library.com/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### NFL Data
- [ESPN API Unofficial Documentation](https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b)
- [NFL Schedule Format](https://www.pro-football-reference.com/)

Need help? Check the existing documentation in the `docs/` folder or create an issue in the repository!