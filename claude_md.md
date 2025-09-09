# Fantasy NFL Dashboard - "Football Winners and Jets"

## Project Overview

Build a modern, real-time fantasy football dashboard for an 8-player league with a unique twist: players compete in TWO separate competitions - one for accumulating the most total wins, and another for accumulating the most total losses among their selected NFL teams.

## Core Concept

- 8 human players each select 4 NFL teams at season start
- Dual prize pools: "Most Wins" and "Most Losses" 
- Real-time tracking of team performance throughout NFL season
- Weekly AI-generated narratives with drama and humor
- Achievement/badge system with 20+ possible awards
- Social media sharing capabilities
- Mobile-responsive modern sports aesthetic

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Hosting**: Vercel (full-stack deployment)
- **Data Storage**: JSON files (simple, version-controlled)
- **Charts**: Recharts for historical visualizations
- **LLM**: Grok API for weekly narratives
- **NFL Data**: ESPN API + betting odds integration
- **Social Graphics**: Sharp for image generation

## Key Features

### 1. Dual Leaderboards
- Real-time standings for "Most Wins" competition
- Real-time standings for "Most Losses" competition  
- ELO-based rankings with predictive modeling
- Integration of betting odds for probability calculations

### 2. Player Dashboard
- Individual player cards showing their 4 teams
- Current team records and recent performance
- Personal achievement badges earned
- Historical performance trends

### 3. Advanced Statistics
- Probability engine for season outcome predictions
- Strength of remaining schedule analysis
- "Magic numbers" for clinching/elimination
- Monte Carlo simulations for final standings

### 4. Historical Tracking
- Week-by-week performance charts
- Momentum indicators and streaks
- Season timeline with key moments
- Performance efficiency metrics

### 5. Weekly Narratives
- Grok-generated dramatic and humorous content
- Player spotlights and league storylines
- Good-natured roasting and trash talk material
- Paragraph-length engaging summaries

### 6. Achievement System
- 20+ possible badges/achievements
- Real-time achievement detection
- Categories: performance, consistency, chaos, predictions
- Visual badge display with earning timestamps

### 7. Social Sharing
- Auto-generated square graphics for social media
- Weekly leaderboard snapshots
- Achievement announcements
- Major milestone graphics

## Technical Requirements

### Data Flow
1. **Initialization**: Load player/team config from JSON
2. **Updates**: Check NFL API after game completion (30min fallback)
3. **Processing**: Calculate statistics, probabilities, achievements
4. **Narrative**: Generate weekly summaries via Grok API
5. **Display**: Real-time dashboard updates
6. **Export**: Social media graphic generation

### Performance Requirements
- Support 8 concurrent users
- Sub-2 second page loads
- Mobile-responsive design
- Graceful offline/API failure handling
- Smart caching to minimize API calls

### Data Persistence
- `config/players.json`: Player names and team selections
- `data/results.json`: Current NFL team standings and records
- `data/history.json`: Week-by-week historical performance
- `data/achievements.json`: Player achievement tracking
- `data/narratives.json`: Weekly AI-generated stories

## Project Structure

```
fantasy-nfl-dashboard/
├── config/
│   └── players.json
├── data/
│   ├── results.json
│   ├── history.json
│   ├── achievements.json
│   └── narratives.json
├── src/
│   ├── app/
│   │   ├── page.js (main dashboard)
│   │   ├── layout.js
│   │   ├── globals.css
│   │   └── api/
│   │       ├── update-scores/route.js
│   │       ├── generate-narrative/route.js
│   │       └── export-image/route.js
│   ├── components/
│   │   ├── Leaderboards.js
│   │   ├── PlayerCards.js
│   │   ├── HistoricalCharts.js
│   │   ├── WeeklyNarrative.js
│   │   ├── AchievementBadges.js
│   │   └── SocialShare.js
│   ├── utils/
│   │   ├── nflApi.js
│   │   ├── calculations.js
│   │   ├── achievements.js
│   │   └── imageGenerator.js
│   └── styles/
│       └── design-system.css
└── public/
    ├── team-logos/
    └── achievement-icons/
```

## Development Phases

1. **Phase 1**: Core structure, basic UI, player config template
2. **Phase 2**: NFL API integration, real-time updates
3. **Phase 3**: Statistical calculations, ELO ratings
4. **Phase 4**: Historical charts, achievement system
5. **Phase 5**: Grok integration, weekly narratives
6. **Phase 6**: Social sharing, image generation
7. **Phase 7**: Polish, mobile optimization, error handling

## Success Criteria

- Accurate real-time NFL data tracking
- Engaging visual design that keeps players checking frequently  
- Reliable automated updates without manual intervention
- Entertaining AI narratives that enhance league engagement
- Comprehensive achievement system that rewards various play styles
- Seamless mobile experience for on-the-go checking
- Easy social sharing to build league community

## Next Steps

Refer to the accompanying technical specification files for detailed implementation guidance:
- `technical-requirements.md`
- `ui-design-system.md` 
- `data-structures.md`
- `features-breakdown.md`
- `deployment-guide.md`