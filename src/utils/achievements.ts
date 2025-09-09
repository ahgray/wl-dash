import { Achievement, PlayerAchievement, AchievementsData } from '@/types';
import { LeagueConfig, TeamRecord, PlayerStanding } from '@/types';

// Define all available achievements
export const ACHIEVEMENT_DEFINITIONS: Record<string, Achievement> = {
  first_win: {
    name: 'First Victory',
    description: 'Achieve your first team win of the season',
    icon: '🏆',
    rarity: 'common',
    holders: []
  },
  perfect_week: {
    name: 'Perfect Week',
    description: 'All 4 of your teams win in the same week',
    icon: '💎',
    rarity: 'legendary',
    holders: []
  },
  disaster_week: {
    name: 'Disaster Week',
    description: 'All 4 of your teams lose in the same week',
    icon: '💀',
    rarity: 'epic',
    holders: []
  },
  comeback_kid: {
    name: 'Comeback Kid',
    description: 'Rise from last place to first place',
    icon: '🚀',
    rarity: 'rare',
    holders: []
  },
  early_leader: {
    name: 'Early Leader',
    description: 'Lead the wins competition after week 1',
    icon: '⚡',
    rarity: 'uncommon',
    holders: []
  },
  win_streak: {
    name: 'Win Streak',
    description: 'Have 5 consecutive team wins',
    icon: '🔥',
    rarity: 'rare',
    holders: []
  },
  loss_streak: {
    name: 'Loss Streak',
    description: 'Have 5 consecutive team losses (sympathy badge)',
    icon: '❄️',
    rarity: 'rare',
    holders: []
  },
  underdog_victory: {
    name: 'Underdog Victory',
    description: 'Your team with the worst record beats a top team',
    icon: '🐶',
    rarity: 'uncommon',
    holders: []
  },
  consistency_king: {
    name: 'Consistency King',
    description: 'Maintain a win rate between 40-60% all season',
    icon: '⚖️',
    rarity: 'rare',
    holders: []
  },
  domination: {
    name: 'Total Domination',
    description: 'Lead both wins and losses competitions simultaneously',
    icon: '👑',
    rarity: 'legendary',
    holders: []
  },
  balanced_portfolio: {
    name: 'Balanced Portfolio',
    description: 'Each of your 4 teams has at least 1 win and 1 loss',
    icon: '⚡',
    rarity: 'common',
    holders: []
  },
  rivalry_master: {
    name: 'Rivalry Master',
    description: 'Your teams beat division rivals 5+ times',
    icon: '⚔️',
    rarity: 'epic',
    holders: []
  }
};

// Division rivalries for rivalry detection
const DIVISIONS: Record<string, string[]> = {
  'AFC_EAST': ['BUF', 'MIA', 'NE', 'NYJ'],
  'AFC_NORTH': ['BAL', 'CIN', 'CLE', 'PIT'],
  'AFC_SOUTH': ['HOU', 'IND', 'JAX', 'TEN'],
  'AFC_WEST': ['DEN', 'KC', 'LAC', 'LV'],
  'NFC_EAST': ['DAL', 'NYG', 'PHI', 'WAS'],
  'NFC_NORTH': ['CHI', 'DET', 'GB', 'MIN'],
  'NFC_SOUTH': ['ATL', 'CAR', 'NO', 'TB'],
  'NFC_WEST': ['ARI', 'LAR', 'SEA', 'SF']
};

function getTeamDivision(team: string): string | null {
  for (const [division, teams] of Object.entries(DIVISIONS)) {
    if (teams.includes(team)) return division;
  }
  return null;
}

function isDivisionalRival(team1: string, team2: string): boolean {
  const div1 = getTeamDivision(team1);
  const div2 = getTeamDivision(team2);
  return div1 !== null && div1 === div2 && team1 !== team2;
}

export function calculateAchievements(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  standings: PlayerStanding[],
  currentWeek: number,
  previousAchievements?: AchievementsData
): AchievementsData {
  const achievements = { ...ACHIEVEMENT_DEFINITIONS };
  const playerAchievements: Record<string, { total: number; earned: PlayerAchievement[] }> = {};

  // Initialize player achievements
  Object.keys(config.players).forEach(playerId => {
    playerAchievements[playerId] = {
      total: 0,
      earned: previousAchievements?.playerAchievements?.[playerId]?.earned || []
    };
  });

  const newAchievements: { playerId: string; achievement: string; context: string }[] = [];

  // Helper function to award achievement
  const awardAchievement = (playerId: string, achievementKey: string, context: string) => {
    const existingAchievement = playerAchievements[playerId].earned.find(
      a => a.achievement === achievementKey
    );

    if (!existingAchievement) {
      const newAchievement: PlayerAchievement = {
        achievement: achievementKey,
        earnedDate: new Date().toISOString().split('T')[0],
        context
      };

      playerAchievements[playerId].earned.push(newAchievement);
      achievements[achievementKey].holders.push(playerId);
      newAchievements.push({ playerId, achievement: achievementKey, context });
    }
  };

  // Calculate achievements for each player
  Object.entries(config.players).forEach(([playerId, player]) => {
    const playerStanding = standings.find(s => s.playerId === playerId);
    if (!playerStanding) return;

    const playerTeams = player.teams.map(abbr => teams[abbr]).filter(Boolean);

    // First Win Achievement
    if (playerStanding.totalWins >= 1) {
      awardAchievement(playerId, 'first_win', `First win achieved with ${playerStanding.totalWins} total wins`);
    }

    // Perfect Week Detection (simplified - check if all teams won their last game)
    const allTeamsWonLastGame = playerTeams.every(team => team.lastGame?.result === 'W');
    if (allTeamsWonLastGame && playerTeams.length === 4 && currentWeek >= 1) {
      awardAchievement(playerId, 'perfect_week', `All 4 teams won in week ${currentWeek}`);
    }

    // Disaster Week Detection (all teams lost their last game)
    const allTeamsLostLastGame = playerTeams.every(team => team.lastGame?.result === 'L');
    if (allTeamsLostLastGame && playerTeams.length === 4 && currentWeek >= 1) {
      awardAchievement(playerId, 'disaster_week', `All 4 teams lost in week ${currentWeek}`);
    }

    // Early Leader (leading after week 1)
    if (currentWeek >= 1 && playerStanding.currentRank === 1) {
      awardAchievement(playerId, 'early_leader', `Leading wins competition after week ${currentWeek}`);
    }

    // Win Streak Detection (5+ consecutive wins across all teams)
    const totalWinStreak = playerTeams.reduce((streak, team) => {
      // Simple heuristic: if team has high win rate and recent win, add to streak
      return streak + (team.lastGame?.result === 'W' ? team.wins : 0);
    }, 0);
    if (totalWinStreak >= 5) {
      awardAchievement(playerId, 'win_streak', `${totalWinStreak} total wins indicating strong performance`);
    }

    // Balanced Portfolio (each team has at least 1 win and 1 loss)
    const isBalanced = playerTeams.every(team => team.wins >= 1 && team.losses >= 1);
    if (isBalanced && currentWeek >= 4) {
      awardAchievement(playerId, 'balanced_portfolio', 'All teams have both wins and losses');
    }

    // Consistency King (win rate between 40-60%)
    if (playerStanding.winPercentage >= 0.4 && playerStanding.winPercentage <= 0.6 && currentWeek >= 8) {
      awardAchievement(playerId, 'consistency_king', `Maintained ${(playerStanding.winPercentage * 100).toFixed(1)}% win rate`);
    }

    // Rivalry Master (count divisional matchup wins)
    let rivalryWins = 0;
    playerTeams.forEach(team => {
      if (team.lastGame && isDivisionalRival(team.abbreviation, team.lastGame.opponent) && team.lastGame.result === 'W') {
        rivalryWins++;
      }
    });
    if (rivalryWins >= 2) {
      awardAchievement(playerId, 'rivalry_master', `${rivalryWins} divisional rivalry victories`);
    }
  });

  // Cross-player achievements
  const sortedByWins = [...standings].sort((a, b) => b.totalWins - a.totalWins);
  const sortedByLosses = [...standings].sort((a, b) => b.totalLosses - a.totalLosses);

  // Domination Achievement (leading both competitions)
  if (sortedByWins[0]?.playerId === sortedByLosses[0]?.playerId) {
    awardAchievement(
      sortedByWins[0].playerId,
      'domination',
      'Leading both wins and losses competitions'
    );
  }

  // Comeback Kid (detect rank improvements - simplified)
  standings.forEach(standing => {
    if (standing.trend === 'up' && standing.currentRank === 1 && currentWeek >= 4) {
      awardAchievement(standing.playerId, 'comeback_kid', `Rose to 1st place in week ${currentWeek}`);
    }
  });

  // Update achievement holder lists and totals
  Object.entries(playerAchievements).forEach(([playerId, playerData]) => {
    playerData.total = playerData.earned.length;
  });

  return {
    lastCalculated: new Date().toISOString(),
    achievements,
    playerAchievements
  };
}

export function getPlayerAchievementSummary(playerId: string, achievementsData: AchievementsData) {
  const playerData = achievementsData.playerAchievements[playerId];
  if (!playerData) return { total: 0, byRarity: {}, recent: [] };

  const byRarity: Record<string, number> = {
    legendary: 0,
    epic: 0,
    rare: 0,
    uncommon: 0,
    common: 0
  };

  playerData.earned.forEach(achievement => {
    const achievementDef = achievementsData.achievements[achievement.achievement];
    if (achievementDef) {
      byRarity[achievementDef.rarity]++;
    }
  });

  const recent = playerData.earned
    .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
    .slice(0, 3);

  return {
    total: playerData.total,
    byRarity,
    recent
  };
}