import React from 'react';
import { PlayerStanding, LeagueConfig, TeamRecord } from '@/types';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTeamLogo } from '@/utils/nflApi';

interface LeaderboardsProps {
  winsLeaderboard: PlayerStanding[];
  lossesLeaderboard: PlayerStanding[];
  config: LeagueConfig;
  teams: Record<string, TeamRecord>;
}

const Leaderboards: React.FC<LeaderboardsProps> = ({
  winsLeaderboard,
  lossesLeaderboard,
  config,
  teams,
}) => {
  const renderTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-neon-green" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-neon-red" />;
      default:
        return <Minus className="w-4 h-4 text-secondary-text" />;
    }
  };

  const renderLeaderboard = (
    standings: PlayerStanding[],
    title: string,
    accentColor: string,
    showWins: boolean
  ) => (
    <div className="leaderboard-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className={`w-6 h-6 ${accentColor}`} />
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {standings.map((standing, index) => (
          <div
            key={standing.playerId}
            className={`flex items-center justify-between p-3 rounded-lg transition-all player-card ${
              index === 0 ? (showWins ? 'team-win' : 'team-loss') : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? 'rank-1'
                    : index === 1
                    ? 'rank-2'
                    : index === 2
                    ? 'rank-3'
                    : 'bg-accent-bg text-secondary-text'
                }`}
              >
                {standing.currentRank}
              </div>
              <div>
                <p className="font-medium">{standing.playerName}</p>
                <div className="flex gap-1 mt-1">
                  {standing.teams.map((teamAbbr) => {
                    const logoUrl = getTeamLogo(teamAbbr); // Get team logo URL
                    return logoUrl ? (
                      <img
                        key={teamAbbr}
                        src={logoUrl}
                        alt={teamAbbr}
                        className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity"
                        title={teams[teamAbbr]?.name || teamAbbr}
                      />
                    ) : (
                      <div
                        key={teamAbbr}
                        className="w-5 h-5 bg-accent-bg rounded-sm flex items-center justify-center text-xs font-bold text-secondary-text opacity-60"
                        title={teams[teamAbbr]?.name || teamAbbr}
                      >
                        {teamAbbr.slice(0, 2)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-bold text-lg ${showWins ? 'text-neon-green' : 'text-neon-red'}`}>
                  {showWins ? standing.totalWins : standing.totalLosses}
                </p>
                <p className="text-xs text-secondary-text">
                  {showWins ? standing.totalLosses + 'L' : standing.totalWins + 'W'}
                </p>
              </div>
              {renderTrendIcon(standing.trend)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderLeaderboard(winsLeaderboard, 'Most Wins Competition', 'text-neon-green', true)}
      {renderLeaderboard(lossesLeaderboard, 'Most Losses Competition', 'text-neon-red', false)}
    </div>
  );
};

export default Leaderboards;