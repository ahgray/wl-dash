import React from 'react';
import { LeagueConfig, TeamRecord } from '@/types';
import { runMonteCarloSimulation } from '@/utils/calculations';
import { BarChart, Activity, Target, Zap } from 'lucide-react';

interface StatsDisplayProps {
  config: LeagueConfig;
  teams: Record<string, TeamRecord>;
  currentWeek: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ config, teams, currentWeek }) => {
  const probabilities = runMonteCarloSimulation(config, teams, currentWeek, 1000);

  const getTopProbabilities = () => {
    const winProbs = Object.entries(probabilities)
      .map(([id, model]) => ({
        name: model.player,
        probability: model.winsCompetition.probabilityToWin,
        type: 'wins',
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    const lossProbs = Object.entries(probabilities)
      .map(([id, model]) => ({
        name: model.player,
        probability: model.lossesCompetition.probabilityToWin,
        type: 'losses',
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    return { winProbs, lossProbs };
  };

  const { winProbs, lossProbs } = getTopProbabilities();

  const totalGames = Object.values(teams).reduce(
    (acc, team) => acc + team.wins + team.losses + team.ties,
    0
  );

  const totalWins = Object.values(teams).reduce((acc, team) => acc + team.wins, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Statistical Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-6 h-6 text-neon-blue" />
          </div>
          <p className="stat-number">{currentWeek || 0}</p>
          <p className="stat-label">Current Week</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-center mb-2">
            <BarChart className="w-6 h-6 text-neon-green" />
          </div>
          <p className="stat-number">{totalGames}</p>
          <p className="stat-label">Games Played</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-neon-purple" />
          </div>
          <p className="stat-number">
            {totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0'}%
          </p>
          <p className="stat-label">League Win Rate</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-neon-yellow" />
          </div>
          <p className="stat-number">{18 - currentWeek}</p>
          <p className="stat-label">Weeks Remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="leaderboard-card">
          <h3 className="text-lg font-semibold mb-4 text-neon-green">
            Win Championship Probability
          </h3>
          <div className="space-y-3">
            {winProbs.map((prob, index) => (
              <div key={prob.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'bg-accent-bg text-secondary-text'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium">{prob.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="progress-bar w-24">
                    <div
                      className="progress-fill progress-wins"
                      style={{ width: `${prob.probability * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium font-display text-neon-green min-w-0 text-right">
                    {(prob.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard-card">
          <h3 className="text-lg font-semibold mb-4 text-neon-red">
            Loss Championship Probability
          </h3>
          <div className="space-y-3">
            {lossProbs.map((prob, index) => (
              <div key={prob.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'bg-accent-bg text-secondary-text'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium">{prob.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="progress-bar w-24">
                    <div
                      className="progress-fill progress-losses"
                      style={{ width: `${prob.probability * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium font-display text-neon-red min-w-0 text-right">
                    {(prob.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;