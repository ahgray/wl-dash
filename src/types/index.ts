export interface Player {
  name: string;
  teams: string[];
  joinDate: string;
}

export interface LeagueConfig {
  leagueName: string;
  season: string;
  seasonStart: string;
  seasonEnd: string;
  playoffStart: string;
  superbowl: string;
  players: Record<string, Player>;
}

export interface TeamRecord {
  name: string;
  abbreviation: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  elo: number;
  previousElo: number;
  lastGame?: {
    date: string;
    opponent: string;
    result: 'W' | 'L' | 'T';
    score: string;
    wasHome: boolean;
  };
  nextGame?: {
    date: string;
    opponent: string;
    isHome: boolean;
    odds?: number;
  };
  remainingSchedule: string[];
  strengthOfSchedule: number;
}

export interface Results {
  lastUpdated: string;
  currentWeek: number;
  gamesInProgress: string[];
  nextUpdate: string;
  teams: Record<string, TeamRecord>;
}

export interface PlayerWeeklyStats {
  totalWins: number;
  totalLosses: number;
  weeklyWins: number;
  weeklyLosses: number;
  winRank: number;
  lossRank: number;
  teams: Record<string, {
    result: 'W' | 'L' | 'T';
    score: string;
  }>;
}

export interface WeekHistory {
  weekStart: string;
  weekEnd: string;
  gamesCompleted: number;
  upsets: Array<{
    game: string;
    favorite: string;
    underdog: string;
    spread: number;
    result: string;
  }>;
  playerStats: Record<string, PlayerWeeklyStats>;
  leaderboards: {
    mostWins: Array<{
      player: string;
      wins: number;
      rank: number;
    }>;
    mostLosses: Array<{
      player: string;
      losses: number;
      rank: number;
    }>;
  };
}

export interface History {
  seasonStart: string;
  weeks: Record<string, WeekHistory>;
}

export interface Achievement {
  name: string;
  description: string;
  icon: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  holders: string[];
}

export interface PlayerAchievement {
  achievement: string;
  earnedDate: string;
  context: string;
}

export interface AchievementsData {
  lastCalculated: string;
  achievements: Record<string, Achievement>;
  playerAchievements: Record<string, {
    total: number;
    earned: PlayerAchievement[];
  }>;
}

export interface Narrative {
  title: string;
  content: string;
  highlights: string[];
  nextWeekPreview: string;
  socialShareText: string;
  wordCount: number;
}

export interface NarrativesData {
  currentWeek: number;
  lastGenerated: string;
  narratives: Record<string, Narrative>;
}

export interface PlayerStanding {
  playerId: string;
  playerName: string;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
  teams: string[];
  trend: 'up' | 'down' | 'same';
  previousRank?: number;
  currentRank: number;
  achievements: string[];
}

export interface ProbabilityModel {
  player: string;
  simulations: number;
  winsCompetition: {
    currentRank: number;
    probabilityToWin: number;
    probabilityTop3: number;
    expectedFinalWins: number;
    confidenceInterval: [number, number];
  };
  lossesCompetition: {
    currentRank: number;
    probabilityToWin: number;
    probabilityTop3: number;
    expectedFinalLosses: number;
    confidenceInterval: [number, number];
  };
  magicNumbers: {
    winsToGuaranteeWinsTitle: number;
    lossesToGuaranteeLossesTitle: number;
  };
}