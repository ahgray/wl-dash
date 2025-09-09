import { TeamRecord, PlayerStanding, ProbabilityModel } from '@/types';
import { LeagueConfig } from '@/types';

// ELO Rating System
export function calculateElo(
  currentElo: number,
  opponentElo: number,
  won: boolean,
  isPlayoffs: boolean = false
): number {
  const K = isPlayoffs ? 40 : 32; // K-factor
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  const actualScore = won ? 1 : 0;
  return Math.round(currentElo + K * (actualScore - expectedScore));
}

// Calculate player standings from team records
export function calculateStandings(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  previousStandings?: PlayerStanding[]
): { winsLeaderboard: PlayerStanding[]; lossesLeaderboard: PlayerStanding[] } {
  const standings: PlayerStanding[] = [];

  Object.entries(config.players).forEach(([playerId, player]) => {
    let totalWins = 0;
    let totalLosses = 0;
    let totalTies = 0;

    player.teams.forEach((teamAbbr) => {
      const team = teams[teamAbbr];
      if (team) {
        totalWins += team.wins;
        totalLosses += team.losses;
        totalTies += team.ties;
      }
    });

    const totalGames = totalWins + totalLosses + totalTies;
    const winPercentage = totalGames > 0 ? totalWins / totalGames : 0;

    const previousStanding = previousStandings?.find(s => s.playerId === playerId);

    standings.push({
      playerId,
      playerName: player.name,
      totalWins,
      totalLosses,
      winPercentage,
      teams: player.teams,
      trend: 'same',
      previousRank: previousStanding?.currentRank,
      currentRank: 0,
      achievements: [],
    });
  });

  // Sort for wins leaderboard (most wins first)
  const winsLeaderboard = [...standings].sort((a, b) => {
    if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
    return a.totalLosses - b.totalLosses; // Tiebreaker: fewer losses
  });

  // Sort for losses leaderboard (most losses first)
  const lossesLeaderboard = [...standings].sort((a, b) => {
    if (b.totalLosses !== a.totalLosses) return b.totalLosses - a.totalLosses;
    return b.totalWins - a.totalWins; // Tiebreaker: more wins
  });

  // Assign ranks and trends for wins leaderboard
  winsLeaderboard.forEach((standing, index) => {
    standing.currentRank = index + 1;
    if (standing.previousRank) {
      if (standing.currentRank < standing.previousRank) standing.trend = 'up';
      else if (standing.currentRank > standing.previousRank) standing.trend = 'down';
    }
  });

  // Create a separate copy for losses leaderboard with its own ranks
  const lossesLeaderboardWithRanks = lossesLeaderboard.map((standing, index) => ({
    ...standing,
    currentRank: index + 1,
    trend: standing.previousRank ? (
      (index + 1) < standing.previousRank ? 'up' as const :
      (index + 1) > standing.previousRank ? 'down' as const : 'same' as const
    ) : 'same' as const
  }));

  return { winsLeaderboard, lossesLeaderboard: lossesLeaderboardWithRanks };
}

// Monte Carlo simulation for season predictions
export function runMonteCarloSimulation(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  currentWeek: number,
  simulations: number = 1000
): Record<string, ProbabilityModel> {
  const results: Record<string, ProbabilityModel> = {};
  const totalWeeks = 18; // NFL regular season weeks
  const remainingWeeks = totalWeeks - currentWeek;
  
  // Initialize counters for each player
  const playerStats: Record<string, {
    winsFirst: number;
    winsTop3: number;
    lossesFirst: number;
    lossesTop3: number;
    totalWins: number[];
    totalLosses: number[];
  }> = {};

  Object.keys(config.players).forEach(playerId => {
    playerStats[playerId] = {
      winsFirst: 0,
      winsTop3: 0,
      lossesFirst: 0,
      lossesTop3: 0,
      totalWins: [],
      totalLosses: []
    };
  });

  console.log(`🎲 Running ${simulations} Monte Carlo simulations for ${Object.keys(config.players).length} players...`);
  
  // Run all simulations comparing all players
  for (let sim = 0; sim < simulations; sim++) {
    const simulatedPlayers: Array<{id: string, wins: number, losses: number}> = [];
    
    // Simulate each player's season
    Object.entries(config.players).forEach(([playerId, player]) => {
      let simWins = 0;
      let simLosses = 0;

      player.teams.forEach((teamAbbr) => {
        const team = teams[teamAbbr];
        if (team) {
          // Start with current wins/losses
          simWins += team.wins;
          simLosses += team.losses;

          // Simulate remaining games
          for (let w = 0; w < remainingWeeks; w++) {
            const winPct = team.winPct || 0.5; // Use actual win percentage or 50%
            if (Math.random() < winPct) {
              simWins++;
            } else {
              simLosses++;
            }
          }
        }
      });

      simulatedPlayers.push({id: playerId, wins: simWins, losses: simLosses});
      playerStats[playerId].totalWins.push(simWins);
      playerStats[playerId].totalLosses.push(simLosses);
    });

    // Rank players for this simulation
    const winRanking = [...simulatedPlayers].sort((a, b) => b.wins - a.wins);
    const lossRanking = [...simulatedPlayers].sort((a, b) => b.losses - a.losses);

    // Count wins competition results
    winRanking.forEach((player, index) => {
      if (index === 0) playerStats[player.id].winsFirst++;
      if (index < 3) playerStats[player.id].winsTop3++;
    });

    // Count losses competition results
    lossRanking.forEach((player, index) => {
      if (index === 0) playerStats[player.id].lossesFirst++;
      if (index < 3) playerStats[player.id].lossesTop3++;
    });
  }

  // Calculate current standings
  const allPlayerWins = Object.entries(config.players).map(([id, p]) => {
    let wins = 0;
    p.teams.forEach(t => {
      const team = teams[t];
      if (team) wins += team.wins;
    });
    return { id, wins };
  });

  const allPlayerLosses = Object.entries(config.players).map(([id, p]) => {
    let losses = 0;
    p.teams.forEach(t => {
      const team = teams[t];
      if (team) losses += team.losses;
    });
    return { id, losses };
  });

  allPlayerWins.sort((a, b) => b.wins - a.wins);
  allPlayerLosses.sort((a, b) => b.losses - a.losses);

  console.log('✅ Simulations complete, generating probability results...');
  
  // Generate results for each player
  Object.entries(config.players).forEach(([playerId, player]) => {
    const stats = playerStats[playerId];
    const currentWinRank = allPlayerWins.findIndex(p => p.id === playerId) + 1;
    const currentLossRank = allPlayerLosses.findIndex(p => p.id === playerId) + 1;
    
    const expectedWins = stats.totalWins.reduce((a, b) => a + b, 0) / simulations;
    const expectedLosses = stats.totalLosses.reduce((a, b) => a + b, 0) / simulations;

    results[playerId] = {
      player: player.name,
      simulations,
      winsCompetition: {
        currentRank: currentWinRank,
        probabilityToWin: stats.winsFirst / simulations,
        probabilityTop3: stats.winsTop3 / simulations,
        expectedFinalWins: expectedWins,
        confidenceInterval: [
          Math.min(...stats.totalWins),
          Math.max(...stats.totalWins)
        ],
      },
      lossesCompetition: {
        currentRank: currentLossRank,
        probabilityToWin: stats.lossesFirst / simulations,
        probabilityTop3: stats.lossesTop3 / simulations,
        expectedFinalLosses: expectedLosses,
        confidenceInterval: [
          Math.min(...stats.totalLosses),
          Math.max(...stats.totalLosses)
        ],
      },
      magicNumbers: {
        winsToGuaranteeWinsTitle: Math.max(0, Math.max(...stats.totalWins) - allPlayerWins[0].wins + 1),
        lossesToGuaranteeLossesTitle: Math.max(0, Math.max(...stats.totalLosses) - allPlayerLosses[0].losses + 1),
      },
    };
  });

  return results;
}

// Calculate strength of schedule
export function calculateStrengthOfSchedule(
  teamSchedule: string[],
  teams: Record<string, TeamRecord>
): number {
  if (teamSchedule.length === 0) return 0.5;

  let totalElo = 0;
  let validTeams = 0;

  teamSchedule.forEach((opponent) => {
    const team = teams[opponent];
    if (team) {
      totalElo += team.elo;
      validTeams++;
    }
  });

  if (validTeams === 0) return 0.5;
  
  // Normalize to 0-1 scale (1500 is average ELO)
  return Math.min(1, Math.max(0, totalElo / validTeams / 1500));
}