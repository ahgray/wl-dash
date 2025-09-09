# Data Structures & API Specifications

## Configuration Files

### config/players.json
```json
{
  "leagueName": "Football Winners and Jets",
  "season": "2025", 
  "seasonStart": "2025-09-04",
  "seasonEnd": "2025-12-29",
  "playoffStart": "2025-01-04",
  "superbowl": "2025-02-09",
  "players": {
    "player1": {
      "name": "John Smith",
      "teams": ["KC", "BUF", "MIA", "NYJ"],
      "joinDate": "2025-08-01"
    },
    "player2": {
      "name": "Sarah Johnson", 
      "teams": ["SF", "LAR", "SEA", "ARI"],
      "joinDate": "2025-08-01"
    },
    "player3": {
      "name": "Mike Davis",
      "teams": ["DAL", "PHI", "NYG", "WAS"],
      "joinDate": "2025-08-01"
    },
    "player4": {
      "name": "Lisa Chen",
      "teams": ["BAL", "PIT", "CIN", "CLE"],
      "joinDate": "2025-08-01"
    },
    "player5": {
      "name": "Chris Wilson",
      "teams": ["GB", "MIN", "CHI", "DET"],
      "joinDate": "2025-08-01"
    },
    "player6": {
      "name": "Emma Rodriguez",
      "teams": ["IND", "TEN", "HOU", "JAX"],
      "joinDate": "2025-08-01"
    },
    "player7": {
      "name": "Alex Taylor",
      "teams": ["DEN", "LV", "LAC", "KC"],
      "joinDate": "2025-08-01"
    },
    "player8": {
      "name": "Jordan Lee",
      "teams": ["TB", "NO", "ATL", "CAR"],
      "joinDate": "2025-08-01"
    }
  }
}
```

## Live Data Files

### data/results.json
```json
{
  "lastUpdated": "2025-09-09T21:30:00Z",
  "currentWeek": 1,
  "gamesInProgress": [],
  "nextUpdate": "2025-09-10T01:00:00Z",
  "teams": {
    "KC": {
      "name": "Kansas City Chiefs",
      "abbreviation": "KC", 
      "wins": 1,
      "losses": 0,
      "ties": 0,
      "winPct": 1.000,
      "elo": 1520,
      "previousElo": 1500,
      "lastGame": {
        "date": "2025-09-09",
        "opponent": "BAL",
        "result": "W",
        "score": "27-20",
        "wasHome": true
      },
      "nextGame": {
        "date": "2025-09-15", 
        "opponent": "CIN",
        "isHome": false,
        "odds": -3.5
      },
      "remainingSchedule": ["CIN", "ATL", "LAC", "NO"],
      "strengthOfSchedule": 0.485
    },
    "BUF": {
      "name": "Buffalo Bills",
      "abbreviation": "BUF",
      "wins": 1,
      "losses": 0, 
      "ties": 0,
      "winPct": 1.000,
      "elo": 1515,
      "previousElo": 1495,
      "lastGame": {
        "date": "2025-09-09",
        "opponent": "ARI",
        "result": "W", 
        "score": "31-17",
        "wasHome": true
      },
      "nextGame": {
        "date": "2025-09-16",
        "opponent": "MIA",
        "isHome": false,
        "odds": -6.5
      },
      "remainingSchedule": ["MIA", "JAX", "TEN", "SEA"],
      "strengthOfSchedule": 0.452
    }
  }
}
```

### data/history.json
```json
{
  "seasonStart": "2025-09-04",
  "weeks": {
    "1": {
      "weekStart": "2025-09-05",
      "weekEnd": "2025-09-09", 
      "gamesCompleted": 16,
      "upsets": [
        {
          "game": "JAX vs IND",
          "favorite": "IND",
          "underdog": "JAX", 
          "spread": -7.5,
          "result": "JAX 24, IND 17"
        }
      ],
      "playerStats": {
        "player1": {
          "totalWins": 2,
          "totalLosses": 2,
          "weeklyWins": 2,
          "weeklyLosses": 2,
          "winRank": 4,
          "lossRank": 4,
          "teams": {
            "KC": {"result": "W", "score": "27-20"},
            "BUF": {"result": "W", "score": "31-17"},
            "MIA": {"result": "L", "score": "14-28"}, 
            "NYJ": {"result": "L", "score": "10-21"}
          }
        },
        "player2": {
          "totalWins": 3,
          "totalLosses": 1,
          "weeklyWins": 3,
          "weeklyLosses": 1,
          "winRank": 1,
          "lossRank": 7,
          "teams": {
            "SF": {"result": "W", "score": "28-14"},
            "LAR": {"result": "W", "score": "21-17"},
            "SEA": {"result": "W", "score": "24-20"},
            "ARI": {"result": "L", "score": "17-31"}
          }
        }
      },
      "leaderboards": {
        "mostWins": [
          {"player": "player2", "wins": 3, "rank": 1},
          {"player": "player3", "wins": 3, "rank": 1}, 
          {"player": "player5", "wins": 2, "rank": 3}
        ],
        "mostLosses": [
          {"player": "player7", "losses": 4, "rank": 1},
          {"player": "player8", "losses": 3, "rank": 2},
          {"player": "player1", "losses": 2, "rank": 3}
        ]
      }
    }
  }
}
```

### data/achievements.json
```json
{
  "lastCalculated": "2025-09-09T21:30:00Z",
  "achievements": {
    "perfect_week": {
      "name": "Perfect Week",
      "description": "All 4 teams won in a single week",
      "icon": "crown",
      "rarity": "legendary",
      "holders": []
    },
    "chaos_agent": {
      "name": "Chaos Agent", 
      "description": "Leading the losses competition",
      "icon": "flame",
      "rarity": "epic",
      "holders": ["player7"]
    },
    "dynasty_builder": {
      "name": "Dynasty Builder",
      "description": "Leading the wins competition", 
      "icon": "trophy",
      "rarity": "epic",
      "holders": ["player2", "player3"]
    },
    "comeback_kid": {
      "name": "Comeback Kid",
      "description": "Biggest weekly improvement in standings",
      "icon": "arrow-up",
      "rarity": "rare",
      "holders": ["player5"]
    },
    "heartbreaker": {
      "name": "Heartbreaker",
      "description": "Team lost by 3 points or less",
      "icon": "heart-break",
      "rarity": "common",
      "holders": ["player1", "player4"]
    },
    "upset_master": {
      "name": "Upset Master",
      "description": "Team won as 7+ point underdog",
      "icon": "surprise",
      "rarity": "rare", 
      "holders": ["player6"]
    }
  },
  "playerAchievements": {
    "player1": {
      "total": 1,
      "earned": [
        {
          "achievement": "heartbreaker",
          "earnedDate": "2025-09-09",
          "context": "MIA lost 14-17 to BUF"
        }
      ]
    },
    "player2": {
      "total": 1,
      "earned": [
        {
          "achievement": "dynasty_builder", 
          "earnedDate": "2025-09-09",
          "context": "Tied for most wins after Week 1"
        }
      ]
    }
  }
}
```

### data/narratives.json
```json
{
  "currentWeek": 1,
  "lastGenerated": "2025-09-09T22:00:00Z",
  "narratives": {
    "1": {
      "title": "Week 1: The Great Awakening",
      "content": "Holy smokes, fantasy football fans! Week 1 just wrapped up and the Football Winners and Jets league is already delivering DRAMA! Sarah Johnson came out swinging with her NFC West powerhouse selection, collecting THREE wins right out of the gate with the 49ers, Rams, and Seahawks all taking care of business. Meanwhile, our defending chaos champion Alex Taylor is living up to expectations with a perfect 0-4 start – now THAT'S commitment to the losses competition! The biggest shocker? Mike Davis thought he was being clever with his all-NFC East strategy, but even a broken clock is right twice a day, and his Cowboys and Eagles both delivered victories. As we head into Week 2, keep your eyes on Lisa Chen – her AFC North picks are looking scary good, and Chris Wilson's Packers just reminded everyone why you never count out Aaron Rodgers in September. Buckle up, folks, because if Week 1 taught us anything, it's that this season is going to be absolutely WILD! 🏈🔥",
      "highlights": [
        "Sarah Johnson takes early lead in wins competition with 3-1 record",
        "Alex Taylor commits fully to chaos with 0-4 start", 
        "Biggest upset: Jacksonville beats Indianapolis by 7",
        "Perfect weather leads to high-scoring games across the board"
      ],
      "nextWeekPreview": "Week 2 brings divisional matchups and revenge games. Will the early leaders maintain their momentum, or is chaos about to strike? Don't miss Thursday Night Football as the drama continues!",
      "socialShareText": "Week 1 is in the books! Sarah leads with 3 wins, Alex embraces the chaos with 4 losses. This season is going to be INSANE! 🏈 #FootballWinnersAndJets",
      "wordCount": 185
    }
  }
}
```

## API Response Formats

### NFL API Response (ESPN)
```json
{
  "events": [
    {
      "id": "401547439",
      "date": "2025-09-09T20:20Z",
      "name": "Kansas City Chiefs at Baltimore Ravens",
      "shortName": "KC @ BAL",
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
          "id": "401547439",
          "date": "2025-09-09T20:20Z",
          "attendance": 71608,
          "type": {
            "id": "1",
            "abbreviation": "STD"
          },
          "timeValid": true,
          "neutralSite": false,
          "status": {
            "clock": 0.0,
            "displayClock": "0:00",
            "period": 4,
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
              "id": "12",
              "uid": "s:20~l:28~t:12",
              "type": "team",
              "order": 0,
              "homeAway": "home", 
              "team": {
                "id": "12",
                "uid": "s:20~l:28~t:12",
                "location": "Baltimore",
                "name": "Ravens",
                "abbreviation": "BAL",
                "displayName": "Baltimore Ravens",
                "shortDisplayName": "Ravens",
                "color": "241773",
                "alternateColor": "000000",
                "isActive": true,
                "logo": "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png"
              },
              "score": "20",
              "record": [
                {
                  "name": "overall",
                  "abbreviation": "Game",
                  "type": "total",
                  "summary": "0-1"
                }
              ]
            },
            {
              "id": "12", 
              "uid": "s:20~l:28~t:12",
              "type": "team",
              "order": 1,
              "homeAway": "away",
              "team": {
                "id": "12",
                "uid": "s:20~l:28~t:12", 
                "location": "Kansas City",
                "name": "Chiefs",
                "abbreviation": "KC",
                "displayName": "Kansas City Chiefs",
                "shortDisplayName": "Chiefs",
                "color": "E31837",
                "alternateColor": "FFB81C",
                "isActive": true,
                "logo": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"
              },
              "score": "27",
              "record": [
                {
                  "name": "overall", 
                  "abbreviation": "Game",
                  "type": "total",
                  "summary": "1-0"
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

### Betting Odds API Response
```json
{
  "id": "4bf90f669c8a2c9f4d6c1c8e6f890123",
  "sport_key": "americanfootball_nfl",
  "sport_title": "NFL",
  "commence_time": "2025-09-15T17:00:00Z",
  "home_team": "Cincinnati Bengals",
  "away_team": "Kansas City Chiefs",
  "bookmakers": [
    {
      "key": "fanduel", 
      "title": "FanDuel",
      "last_update": "2025-09-10T15:30:00Z",
      "markets": [
        {
          "key": "spreads",
          "last_update": "2025-09-10T15:30:00Z", 
          "outcomes": [
            {
              "name": "Cincinnati Bengals",
              "price": -110,
              "point": 3.5
            },
            {
              "name": "Kansas City Chiefs", 
              "price": -110,
              "point": -3.5
            }
          ]
        },
        {
          "key": "totals",
          "last_update": "2025-09-10T15:30:00Z",
          "outcomes": [
            {
              "name": "Over",
              "price": -110, 
              "point": 47.5
            },
            {
              "name": "Under",
              "price": -110,
              "point": 47.5
            }
          ]
        }
      ]
    }
  ]
}
```

## Statistical Calculation Structures

### ELO Rating Updates
```javascript
// ELO calculation structure
const eloUpdate = {
  team: 'KC',
  previousElo: 1500,
  opponentElo: 1485,
  expectedScore: 0.521, // Based on ELO difference
  actualScore: 1, // 1 for win, 0 for loss, 0.5 for tie
  kFactor: 32, // 32 for regular season, 40 for playoffs
  newElo: 1520,
  eloChange: 20
};
```

### Probability Calculations
```javascript
// Monte Carlo simulation structure
const probabilityModel = {
  player: 'player1',
  simulations: 10000,
  winsCompetition: {
    currentRank: 4,
    probabilityToWin: 0.15,
    probabilityTop3: 0.45,
    expectedFinalWins: 8.2,
    confidenceInterval: [6, 11]
  },
  lossesCompetition: {
    currentRank: 4, 
    probabilityToWin: 0.12,
    probabilityTop3: 0.38,
    expectedFinalLosses: 8.8,
    confidenceInterval: [6, 12]
  },
  magicNumbers: {
    winsToGuaranteeWinsTitle: 15,
    lossesToGuaranteeLossesTitle: 13
  }
};
```

## Achievement Tracking Structure

### Achievement Definitions
```javascript
const achievementTypes = {
  // Performance-based
  'perfect_week': { trigger: 'all4TeamsWin', rarity: 'legendary' },
  'disaster_week': { trigger: 'all4TeamsLose', rarity: 'legendary' },
  'dynasty_builder': { trigger: 'leadingWins', rarity: 'epic' },
  'chaos_agent': { trigger: 'leadingLosses', rarity: 'epic' },
  
  // Milestone-based
  'double_digits_wins': { trigger: 'reach10Wins', rarity: 'rare' },
  'double_digits_losses': { trigger: 'reach10Losses', rarity: 'rare' },
  'halfway_hero': { trigger: 'leadAtMidseason', rarity: 'uncommon' },
  
  // Game-specific
  'upset_master': { trigger: 'teamWinsAs7PlusUnderdog', rarity: 'rare' },
  'heartbreaker': { trigger: 'teamLosesBy3OrLess', rarity: 'common' },
  'blowout_victim': { trigger: 'teamLosesBy21Plus', rarity: 'common' },
  'nail_biter': { trigger: 'teamWinsBy3OrLess', rarity: 'common' },
  
  // Streak-based
  'hot_streak': { trigger: 'win4InARow', rarity: 'uncommon' },
  'cold_streak': { trigger: 'lose4InARow', rarity: 'uncommon' },
  'momentum_shift': { trigger: 'biggestWeeklyRankChange', rarity: 'rare' },
  
  // Statistical
  'efficiency_expert': { trigger: 'highestWinPercentage', rarity: 'rare' },
  'draft_genius': { trigger: 'allTeamsMake Playoffs', rarity: 'legendary' },
  'crystal_ball': { trigger: 'predictedUpset', rarity: 'epic' },
  'contrarian': { trigger: 'onlyPlayerWithThisTeam', rarity: 'uncommon' },
  
  // Seasonal
  'wire_to_wire': { trigger: 'ledEveryWeek', rarity: 'legendary' },
  'comeback_story': { trigger: 'lastToFirst', rarity: 'epic' },
  'consistent': { trigger: 'neverOutsideTop4', rarity: 'rare' },
  'volatility_king': { trigger: 'mostRankChanges', rarity: 'uncommon' }
};
```