import axios from 'axios';
import { TeamRecord } from '@/types';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

export interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  week: {
    number: number;
  };
  competitions: Array<{
    id: string;
    date: string;
    status: {
      type: {
        id: string;
        name: string;
        description: string;
        detail: string;
        shortDetail: string;
      };
    };
    competitors: Array<{
      id: string;
      homeAway: 'home' | 'away';
      team: {
        id: string;
        abbreviation: string;
        displayName: string;
        shortDisplayName: string;
        logo: string;
      };
      score: string;
      record: Array<{
        name: string;
        summary: string;
      }>;
    }>;
  }>;
}

export async function fetchCurrentWeekScores(): Promise<{
  week: number;
  games: ESPNGame[];
  teams: Record<string, TeamRecord>;
}> {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/scoreboard`);
    const data = response.data;
    
    const week = data.week?.number || 1;
    const games = data.events || [];
    
    const teams: Record<string, TeamRecord> = {};
    
    // Process each game to extract team records and game details
    games.forEach((game: ESPNGame) => {
      const competition = game.competitions?.[0];
      if (!competition) return;

      const competitors = competition.competitors || [];
      const gameStatus = competition.status?.type?.name || 'unknown';
      const isGameComplete = gameStatus === 'STATUS_FINAL';

      competitors.forEach((competitor) => {
        const abbr = competitor.team.abbreviation;
        const record = competitor.record?.[0]?.summary || '0-0';
        const [wins, losses, ties = '0'] = record.split('-').map(Number);
        
        // Find opponent
        const opponent = competitors.find(c => c.team.abbreviation !== abbr);
        const opponentAbbr = opponent?.team.abbreviation || '';
        
        // Determine game result if completed
        let result: 'W' | 'L' | 'T' | null = null;
        let gameScore = '';
        if (isGameComplete && opponent) {
          const myScore = parseInt(competitor.score || '0');
          const theirScore = parseInt(opponent.score || '0');
          
          if (myScore > theirScore) result = 'W';
          else if (myScore < theirScore) result = 'L';
          else result = 'T';
          
          gameScore = `${myScore}-${theirScore}`;
        }
        
        // If ESPN records are 0 but we have game results, calculate from games
        let actualWins = wins || 0;
        let actualLosses = losses || 0;
        let actualTies = ties || 0;
        
        if (actualWins === 0 && actualLosses === 0 && isGameComplete && result) {
          // ESPN records not updated yet, use game results
          if (result === 'W') {
            actualWins = 1;
          } else if (result === 'L') {
            actualLosses = 1;
          } else {
            actualTies = 1;
          }
        }

        teams[abbr] = {
          name: competitor.team.displayName,
          abbreviation: abbr,
          wins: actualWins,
          losses: actualLosses,
          ties: actualTies,
          winPct: actualWins / (actualWins + actualLosses + actualTies) || 0,
          elo: 1500, // Default ELO, will be calculated properly
          previousElo: 1500,
          lastGame: isGameComplete && result ? {
            date: new Date(competition.date).toISOString().split('T')[0],
            opponent: opponentAbbr,
            result: result,
            score: gameScore,
            wasHome: competitor.homeAway === 'home'
          } : undefined,
          remainingSchedule: [],
          strengthOfSchedule: 0.5,
        };
      });
    });
    
    return { week, games, teams };
  } catch (error) {
    console.error('Error fetching NFL scores:', error);
    throw error;
  }
}

export async function fetchTeamSchedule(teamId: string): Promise<any> {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/teams/${teamId}/schedule`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching schedule for team ${teamId}:`, error);
    return null;
  }
}

export async function fetchTeamStandings(): Promise<Record<string, TeamRecord> | null> {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/standings`);
    const standings = response.data;
    const teams: Record<string, TeamRecord> = {};
    
    // ESPN standings API returns different structure, need to parse
    if (standings?.children) {
      standings.children.forEach((conference: any) => {
        conference.standings?.entries?.forEach((entry: any) => {
          const team = entry.team;
          const stats = entry.stats;
          
          const abbr = team.abbreviation;
          const wins = stats?.find((s: any) => s.name === 'wins')?.value || 0;
          const losses = stats?.find((s: any) => s.name === 'losses')?.value || 0;
          const ties = stats?.find((s: any) => s.name === 'ties')?.value || 0;
          
          teams[abbr] = {
            name: team.displayName,
            abbreviation: abbr,
            wins,
            losses,
            ties,
            winPct: wins / (wins + losses + ties) || 0,
            elo: 1500,
            previousElo: 1500,
            remainingSchedule: [],
            strengthOfSchedule: 0.5,
          };
        });
      });
    }
    
    return teams;
  } catch (error) {
    console.error('Error fetching standings:', error);
    return null;
  }
}

// Map of NFL team abbreviations to ESPN team IDs
export const TEAM_ID_MAP: Record<string, string> = {
  'ARI': '22', 'ATL': '1', 'BAL': '33', 'BUF': '2',
  'CAR': '29', 'CHI': '3', 'CIN': '4', 'CLE': '5',
  'DAL': '6', 'DEN': '7', 'DET': '8', 'GB': '9',
  'HOU': '34', 'IND': '11', 'JAX': '30', 'KC': '12',
  'LAC': '24', 'LAR': '14', 'LV': '13', 'MIA': '15',
  'MIN': '16', 'NE': '17', 'NO': '18', 'NYG': '19',
  'NYJ': '20', 'PHI': '21', 'PIT': '23', 'SEA': '26',
  'SF': '25', 'TB': '27', 'TEN': '10', 'WAS': '28'
};

export function getTeamLogo(abbreviation: string): string {
  const teamId = TEAM_ID_MAP[abbreviation];
  if (!teamId) return '';
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbreviation.toLowerCase()}.png`;
}

export async function fetchNFLData(): Promise<{
  currentWeek: number;
  teams: Record<string, TeamRecord>;
  lastUpdated: string;
}> {
  const { withCache, CacheKeys } = await import('./cache');
  
  return withCache(
    CacheKeys.NFL_DATA,
    async () => {
      try {
        // Fetch both scoreboard and standings data in parallel
        const [scoreboardData, standingsData] = await Promise.all([
          fetchCurrentWeekScores().catch(() => null),
          fetchTeamStandings().catch(() => null)
        ]);

        const currentWeek = scoreboardData?.week || 1;
        let teams: Record<string, TeamRecord> = {};

        // Start with standings data for accurate records
        if (standingsData) {
          teams = { ...standingsData };
        }

        // Enhance with recent game information from scoreboard
        if (scoreboardData?.teams) {
          Object.entries(scoreboardData.teams).forEach(([abbr, scoreboardTeam]) => {
            if (teams[abbr]) {
              // Merge scoreboard data with standings data
              teams[abbr] = {
                ...teams[abbr],
                lastGame: scoreboardTeam.lastGame,
                // Use scoreboard record if standings failed
                ...(standingsData ? {} : {
                  wins: scoreboardTeam.wins,
                  losses: scoreboardTeam.losses,
                  ties: scoreboardTeam.ties,
                  winPct: scoreboardTeam.winPct
                })
              };
            } else {
              // Fallback to scoreboard data if standings missing
              teams[abbr] = scoreboardTeam;
            }
          });
        }

        return {
          currentWeek,
          teams,
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error fetching NFL data:', error);
        throw new Error('Failed to fetch NFL data');
      }
    },
    30 // Cache for 30 minutes during game days
  );
}