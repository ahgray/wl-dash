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

  // Assign ranks and trends
  winsLeaderboard.forEach((standing, index) => {
    standing.currentRank = index + 1;
    if (standing.previousRank) {
      if (standing.currentRank < standing.previousRank) standing.trend = 'up';
      else if (standing.currentRank > standing.previousRank) standing.trend = 'down';
    }
  });

  lossesLeaderboard.forEach((standing, index) => {
    standing.currentRank = index + 1;
    if (standing.previousRank) {
      if (standing.currentRank < standing.previousRank) standing.trend = 'up';
      else if (standing.currentRank > standing.previousRank) standing.trend = 'down';
    }
  });

  return { winsLeaderboard, lossesLeaderboard };
}

// Monte Carlo simulation for season predictions
export function runMonteCarloSimulation(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  currentWeek: number,
  simulations: number = 10000
): Record<string, ProbabilityModel> {
  const results: Record<string, ProbabilityModel> = {};
  const totalWeeks = 18; // NFL regular season weeks
  const remainingWeeks = totalWeeks - currentWeek;

  Object.entries(config.players).forEach(([playerId, player]) => {
    const winSimResults: number[] = [];
    const lossSimResults: number[] = [];
    let winsFirst = 0;
    let winsTop3 = 0;
    let lossesFirst = 0;
    let lossesTop3 = 0;

    // Run simulations
    for (let i = 0; i < simulations; i++) {
      let simWins = 0;
      let simLosses = 0;

      player.teams.forEach((teamAbbr) => {
        const team = teams[teamAbbr];
        if (team) {
          simWins += team.wins;
          simLosses += team.losses;

          // Simulate remaining games based on ELO and win percentage
          for (let w = 0; w < remainingWeeks; w++) {
            const winProb = team.elo / (team.elo + 1500); // Simplified probability
            if (Math.random() < winProb) {
              simWins++;
            } else {
              simLosses++;
            }
          }
        }
      });

      winSimResults.push(simWins);
      lossSimResults.push(simLosses);
    }

    // Sort results to find percentiles
    winSimResults.sort((a, b) => b - a);
    lossSimResults.sort((a, b) => b - a);

    // Calculate probabilities
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

    // Calculate current ranks
    allPlayerWins.sort((a, b) => b.wins - a.wins);
    allPlayerLosses.sort((a, b) => b.losses - a.losses);
    
    const currentWinRank = allPlayerWins.findIndex(p => p.id === playerId) + 1;
    const currentLossRank = allPlayerLosses.findIndex(p => p.id === playerId) + 1;

    // Count simulation results
    winSimResults.forEach((wins, idx) => {
      if (idx === 0) winsFirst++;
      if (idx < 3) winsTop3++;
    });

    lossSimResults.forEach((losses, idx) => {
      if (idx === 0) lossesFirst++;
      if (idx < 3) lossesTop3++;
    });

    const expectedWins = winSimResults.reduce((a, b) => a + b, 0) / simulations;
    const expectedLosses = lossSimResults.reduce((a, b) => a + b, 0) / simulations;

    results[playerId] = {
      player: player.name,
      simulations,
      winsCompetition: {
        currentRank: currentWinRank,
        probabilityToWin: winsFirst / simulations,
        probabilityTop3: winsTop3 / simulations,
        expectedFinalWins: expectedWins,
        confidenceInterval: [
          winSimResults[Math.floor(simulations * 0.25)],
          winSimResults[Math.floor(simulations * 0.75)]
        ],
      },
      lossesCompetition: {
        currentRank: currentLossRank,
        probabilityToWin: lossesFirst / simulations,
        probabilityTop3: lossesTop3 / simulations,
        expectedFinalLosses: expectedLosses,
        confidenceInterval: [
          lossSimResults[Math.floor(simulations * 0.25)],
          lossSimResults[Math.floor(simulations * 0.75)]
        ],
      },
      magicNumbers: {
        winsToGuaranteeWinsTitle: Math.max(0, winSimResults[0] - allPlayerWins[0].wins + 1),
        lossesToGuaranteeLossesTitle: Math.max(0, lossSimResults[0] - allPlayerLosses[0].losses + 1),
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