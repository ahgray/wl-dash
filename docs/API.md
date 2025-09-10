# API Documentation

This document covers the ESPN API integration and internal data processing APIs used in the Winners Losers and the Jets Dashboard.

## ESPN NFL API Integration

### Base URL
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl
```

### Authentication
No authentication required - ESPN provides public access to NFL data.

## Endpoints

### 1. Current Week Scoreboard

**Endpoint**: `GET /scoreboard`

**Description**: Fetches current week games, scores, and basic team records.

**Response Structure**:
```json
{
  "week": {
    "number": 1
  },
  "events": [
    {
      "id": "401671712",
      "date": "2025-09-08T17:00Z",
      "name": "Dallas Cowboys at Cleveland Browns", 
      "shortName": "DAL @ CLE",
      "season": {
        "year": 2025,
        "type": 2,
        "slug": "regular-season"
      },
      "week": {
        "number": 1
      },
      "competitions": [
        {
          "id": "401671712",
          "date": "2025-09-08T17:00Z",
          "status": {
            "type": {
              "id": "3",
              "name": "STATUS_FINAL",
              "description": "Final",
              "detail": "Final",
              "shortDetail": "Final"
            }
          },
          "competitors": [
            {
              "id": "6",
              "homeAway": "away",
              "team": {
                "id": "6",
                "abbreviation": "DAL",
                "displayName": "Dallas Cowboys",
                "shortDisplayName": "Cowboys",
                "logo": "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png"
              },
              "score": "33",
              "record": [
                {
                  "name": "overall",
                  "summary": "1-0"
                }
              ]
            },
            {
              "id": "5", 
              "homeAway": "home",
              "team": {
                "id": "5",
                "abbreviation": "CLE",
                "displayName": "Cleveland Browns",
                "shortDisplayName": "Browns",
                "logo": "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png"
              },
              "score": "17",
              "record": [
                {
                  "name": "overall", 
                  "summary": "0-1"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Usage in App**:
```typescript
const { week, games, teams } = await fetchCurrentWeekScores();
```

### 2. League Standings

**Endpoint**: `GET /standings`

**Description**: Fetches complete NFL standings by conference and division.

**Response Structure**:
```json
{
  "children": [
    {
      "name": "AFC",
      "standings": {
        "entries": [
          {
            "team": {
              "id": "2",
              "abbreviation": "BUF",
              "displayName": "Buffalo Bills"
            },
            "stats": [
              {
                "name": "wins",
                "value": 1
              },
              {
                "name": "losses", 
                "value": 0
              },
              {
                "name": "ties",
                "value": 0
              }
            ]
          }
        ]
      }
    }
  ]
}
```

**Usage in App**:
```typescript
const standings = await fetchTeamStandings();
```

### 3. Team Schedule (Optional)

**Endpoint**: `GET /teams/{teamId}/schedule`

**Description**: Fetches full season schedule for a specific team.

**Parameters**:
- `teamId`: ESPN team ID (see Team ID Map below)

## Team ID Mapping

ESPN uses numeric IDs while the app uses standard NFL abbreviations:

```typescript
export const TEAM_ID_MAP: Record<string, string> = {
  'ARI': '22', 'ATL': '1', 'BAL': '33', 'BUF': '2',
  'CAR': '29', 'CHI': '3', 'CIN': '4', 'CLE': '5', 
  'DAL': '6', 'DEN': '7', 'DET': '8', 'GB': '9',
  'HOU': '34', 'IND': '11', 'JAX': '30', 'KC': '12',
  'LAC': '24', 'LAR': '14', 'LV': '13', 'MIA': '15',
  'MIN': '16', 'NE': '17', 'NO': '18', 'NYG': '19',
  'NYJ': '20', 'PHI': '21', 'PIT': '23', 'SEA': '26',
  'SF': '25', 'TB': '27', 'TEN': '10', 'WSH': '28'
};
```

## Data Processing Pipeline

### 1. Data Fetching (`fetchNFLData`)

**Function**: `src/utils/nflApi.ts`

Combines scoreboard and standings data:
```typescript
const { currentWeek, teams, lastUpdated } = await fetchNFLData();
```

**Process**:
1. Fetch scoreboard and standings in parallel
2. Merge data prioritizing standings for accuracy
3. Add recent game information from scoreboard
4. Cache results for 30 minutes during game days

### 2. Standings Calculation (`calculateStandings`)

**Function**: `src/utils/calculations.ts`

Processes raw NFL data into player standings:
```typescript
const { winsLeaderboard, lossesLeaderboard } = calculateStandings(
  config, teams, previousStandings
);
```

**Algorithm**:
```typescript
// For each player
player.teams.forEach(teamAbbr => {
  const team = teams[teamAbbr];
  totalWins += team.wins;
  totalLosses += team.losses;
  totalTies += team.ties;
});

const winPercentage = totalWins / (totalWins + totalLosses + totalTies);
```

### 3. Monte Carlo Simulation (`runMonteCarloSimulation`)

**Function**: `src/utils/calculations.ts`

Runs 1000+ season simulations for probability predictions:
```typescript
const probabilities = runMonteCarloSimulation(
  config, teams, currentWeek, 1000
);
```

**Algorithm Overview**:
1. **Regression to Mean**: Early season predictions weighted toward 50%
2. **ELO Adjustment**: Factor in team strength ratings
3. **Random Variance**: Add ±5% uncertainty per game
4. **Simulation Loop**: Run complete season 1000+ times
5. **Statistical Analysis**: Calculate win probabilities and confidence intervals

**Key Formula**:
```typescript
// Regression weight decreases as season progresses
const regressionWeight = Math.max(0, 10 - gamesPlayed);

// Base win probability with regression to mean
const baseWinPct = (team.winPct * gamesPlayed + 0.5 * regressionWeight) / 
                  (gamesPlayed + regressionWeight);

// Add ELO and random factors  
const eloFactor = (team.elo - 1500) / 1000;
const randomVariance = (Math.random() - 0.5) * 0.1;
const adjustedWinPct = Math.max(0.1, Math.min(0.9, 
  baseWinPct + eloFactor + randomVariance));
```

### 4. ELO Rating System (`calculateElo`)

**Function**: `src/utils/calculations.ts`

Updates team strength ratings after each game:
```typescript
const newElo = calculateElo(currentElo, opponentElo, won, isPlayoffs);
```

**Formula**:
```typescript
const K = isPlayoffs ? 40 : 32; // K-factor
const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
const actualScore = won ? 1 : 0;
return Math.round(currentElo + K * (actualScore - expectedScore));
```

## Caching Strategy

### Cache Configuration (`src/utils/cache.ts`)

```typescript
export enum CacheKeys {
  NFL_DATA = 'nfl_data',
  STANDINGS = 'standings', 
  PROBABILITIES = 'monte_carlo',
  ACHIEVEMENTS = 'achievements',
  NARRATIVES = 'narratives'
}

const CACHE_DURATIONS = {
  [CacheKeys.NFL_DATA]: 30 * 60 * 1000,        // 30 minutes
  [CacheKeys.STANDINGS]: 5 * 60 * 1000,        // 5 minutes
  [CacheKeys.PROBABILITIES]: 5 * 60 * 1000,    // 5 minutes
  [CacheKeys.ACHIEVEMENTS]: 10 * 60 * 1000,    // 10 minutes
  [CacheKeys.NARRATIVES]: 60 * 60 * 1000,      // 1 hour
};
```

### Usage Pattern

```typescript
const cachedData = await withCache(
  CacheKeys.NFL_DATA,
  async () => {
    // Expensive API call
    return await fetchFromAPI();
  },
  30 // Cache for 30 minutes
);
```

## Error Handling

### Common Error Scenarios

1. **ESPN API Unavailable**
   - Fallback to cached data
   - Display last known standings
   - Show "data may be outdated" message

2. **Invalid Team Records** 
   - ESPN sometimes shows 0-0 for all teams early in week
   - Use game results to calculate records manually
   - Cross-reference scoreboard and standings data

3. **Missing Team Logos**
   - Fallback to team abbreviation display
   - Handle CORS and 404 errors gracefully
   - Use conditional rendering to avoid empty src attributes

### Error Response Format

```typescript
interface APIError {
  message: string;
  code?: string;
  timestamp: string;
  endpoint?: string;
}
```

## Rate Limiting

ESPN API has informal rate limits:
- **Recommended**: 1 request per 15-30 seconds
- **Burst Allowed**: Up to 10 requests per minute
- **Implementation**: Built-in caching prevents excessive calls

## Development Testing

### Mock Data

Use sample data files for development:
- `data/sample-results.json` - Mock NFL results
- `data/sample-narratives.json` - Example narratives

### Local Testing

```bash
# Test ESPN API connectivity
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"

# Test specific team
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/6"
```

### Debug Logging

Enable debug output in development:
```typescript
console.log(`🎲 Running ${simulations} Monte Carlo simulations...`);
console.log(`✅ Simulations complete, generating results...`);
```

## Integration Examples

### Fetching Live Data

```typescript
import { fetchNFLData } from '@/utils/nflApi';
import { calculateStandings } from '@/utils/calculations';

// Get current NFL data
const { currentWeek, teams } = await fetchNFLData();

// Calculate player standings  
const { winsLeaderboard, lossesLeaderboard } = calculateStandings(
  config, teams
);

// Run probability simulations
const probabilities = runMonteCarloSimulation(
  config, teams, currentWeek
);
```

### Component Integration

```tsx
import { useEffect, useState } from 'react';
import { Results } from '@/types';

const Dashboard = () => {
  const [results, setResults] = useState<Results | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchNFLData();
        setResults(data);
      } catch (error) {
        console.error('Failed to load NFL data:', error);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {results ? (
        <Leaderboards standings={standings} teams={results.teams} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
```

## Performance Considerations

- **Caching**: Aggressive caching reduces API load
- **Parallel Requests**: Fetch scoreboard and standings simultaneously  
- **Error Recovery**: Graceful degradation when APIs fail
- **Bundle Size**: Tree-shake unused ESPN data structures
- **Memory Usage**: Limit Monte Carlo simulation scope during heavy load

## Security Notes

- ESPN API requires no authentication
- All requests are read-only
- No sensitive data stored or transmitted
- CORS handled by Next.js API routes if needed