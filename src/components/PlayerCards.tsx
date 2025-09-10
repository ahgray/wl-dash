import React from 'react';
import { LeagueConfig, TeamRecord, PlayerStanding, AchievementsData } from '@/types';
import { getTeamLogo } from '@/utils/nflApi';
import { Award, ChevronRight } from 'lucide-react';

interface PlayerCardsProps {
  config: LeagueConfig;
  teams: Record<string, TeamRecord>;
  standings: PlayerStanding[];
  achievements: AchievementsData | null;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({
  config,
  teams,
  standings,
  achievements,
}) => {
  const getPlayerAchievements = (playerId: string) => {
    return achievements?.playerAchievements?.[playerId]?.earned || [];
  };

  const getTeamRecord = (teamAbbr: string) => {
    const team = teams[teamAbbr];
    if (!team) return '0-0';
    return `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`;
  };

  const getTeamStatus = (teamAbbr: string) => {
    const team = teams[teamAbbr];
    if (!team?.lastGame) return null;
    return team.lastGame.result;
  };

  return (
    <div className="container-constraint">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Player Rosters</h2>
        <p className="text-secondary-text text-sm">Each player's 4 selected NFL teams and their current performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grid-constraint">
        {Object.entries(config.players).map(([playerId, player]) => {
          const standing = standings.find(s => s.playerId === playerId);
          const playerAchievements = getPlayerAchievements(playerId);
          
          return (
            <div key={playerId} className="player-card animate-slide-up">
              {/* Player Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-secondary-text">
                      {standing?.totalWins || 0}W - {standing?.totalLosses || 0}L
                    </span>
                    <span className="text-xs text-secondary-text">
                      Win Rate: <span className="font-display text-neon-blue">
                        {standing ? (standing.winPercentage * 100).toFixed(1) : '0.0'}%
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {playerAchievements.length > 0 && (
                    <div className="achievement-badge" title={`${playerAchievements.length} achievements earned`}>
                      <Award className="w-3 h-3" />
                      <span className="text-xs">
                        {playerAchievements.length}
                      </span>
                    </div>
                  )}
                  {playerAchievements.slice(0, 3).map((achievement, idx) => {
                    const achievementData = achievements?.achievements?.[achievement.achievement];
                    if (!achievementData) return null;
                    
                    return (
                      <div 
                        key={achievement.achievement}
                        className={`text-sm ${
                          achievementData.rarity === 'legendary' ? 'text-neon-purple' :
                          achievementData.rarity === 'epic' ? 'text-neon-blue' :
                          achievementData.rarity === 'rare' ? 'text-neon-green' :
                          'text-neon-yellow'
                        }`}
                        title={`${achievementData.name}: ${achievementData.description}`}
                      >
                        {achievementData.icon}
                      </div>
                    );
                  })}
                  <div className="text-right">
                    <div className="text-xs text-secondary-text">Current Rank</div>
                    <div className="font-display font-bold text-lg text-neon-green">
                      #{standing?.currentRank || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Grid */}
              <div className="grid grid-cols-2 gap-3 grid-constraint">
                {player.teams.map((teamAbbr) => {
                  const status = getTeamStatus(teamAbbr);
                  const record = getTeamRecord(teamAbbr);
                  const team = teams[teamAbbr];
                  
                  return (
                    <div
                      key={teamAbbr}
                      style={{ maxWidth: '100%', overflow: 'hidden' }}
                      className={`relative p-3 rounded-lg transition-all stat-card group ${
                        status === 'W'
                          ? 'team-win'
                          : status === 'L'
                          ? 'team-loss'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <div className="relative">
                          {(() => {
                            const logoUrl = getTeamLogo(teamAbbr);
                            return logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={teamAbbr}
                                style={{ 
                                  width: '32px', 
                                  height: '32px', 
                                  maxWidth: '32px', 
                                  maxHeight: '32px',
                                  objectFit: 'contain',
                                  flexShrink: 0
                                }}
                                className="team-logo"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  maxWidth: '32px',
                                  maxHeight: '32px',
                                  flexShrink: 0
                                }}
                                className="bg-accent-bg rounded-sm flex items-center justify-center text-sm font-bold text-secondary-text"
                              >
                                {teamAbbr.slice(0, 2)}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate" style={{ maxWidth: '120px' }}>{team?.name || teamAbbr}</p>
                            {status && (
                              <span
                                className={`text-xs font-bold px-1 rounded ${
                                  status === 'W' ? 'text-neon-green' : 'text-neon-red'
                                }`}
                              >
                                {status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-secondary-text">{record}</p>
                          {team?.lastGame && (
                            <p className="text-xs text-muted-text truncate">
                              vs {team.lastGame.opponent}: {team.lastGame.score}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="mt-4 pt-3 border-t flex justify-between text-sm">
                <div className="text-center">
                  <div className="font-display font-bold text-neon-green text-lg">{standing?.totalWins || 0}</div>
                  <div className="text-xs text-secondary-text uppercase tracking-wide">Wins</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-neon-red text-lg">{standing?.totalLosses || 0}</div>
                  <div className="text-xs text-secondary-text uppercase tracking-wide">Losses</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-neon-blue text-lg">
                    {standing ? (standing.winPercentage * 100).toFixed(0) : '0'}%
                  </div>
                  <div className="text-xs text-secondary-text uppercase tracking-wide">Win Rate</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerCards;