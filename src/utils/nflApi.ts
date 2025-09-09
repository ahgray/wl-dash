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
    
    // Process each game to extract team records
    games.forEach((game: ESPNGame) => {
      game.competitions?.[0]?.competitors?.forEach((competitor) => {
        const abbr = competitor.team.abbreviation;
        const record = competitor.record?.[0]?.summary || '0-0';
        const [wins, losses, ties = '0'] = record.split('-').map(Number);
        
        teams[abbr] = {
          name: competitor.team.displayName,
          abbreviation: abbr,
          wins: wins || 0,
          losses: losses || 0,
          ties: ties || 0,
          winPct: (wins || 0) / ((wins || 0) + (losses || 0) + (ties || 0)) || 0,
          elo: 1500, // Default ELO, will be calculated properly
          previousElo: 1500,
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

export async function fetchTeamStandings(): Promise<any> {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/standings`);
    return response.data;
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