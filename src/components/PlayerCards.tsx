import React, { useState } from 'react';
import { LeagueConfig, TeamRecord, PlayerStanding, AchievementsData } from '@/types';
import { getTeamLogo } from '@/utils/nflApi';
import { runMonteCarloSimulation } from '@/utils/calculations';
import { Award, ChevronRight } from 'lucide-react';

interface PlayerCardsProps {
  config: LeagueConfig;
  teams: Record<string, TeamRecord>;
  standings: PlayerStanding[];
  achievements: AchievementsData | null;
  currentWeek: number;
  monteCarloResults?: Record<string, any> | null;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({
  config,
  teams,
  standings,
  achievements,
  currentWeek,
  monteCarloResults,
}) => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  
  // Use passed Monte Carlo results or calculate as fallback
  let probabilities: Record<string, any> = {};
  if (monteCarloResults) {
    probabilities = monteCarloResults;
  } else {
    try {
      probabilities = runMonteCarloSimulation(config, teams, currentWeek, 1000);
    } catch (error) {
      console.error('❌ Monte Carlo simulation failed in PlayerCards:', error);
      // Fallback: equal probabilities if simulation fails
      Object.keys(config.players).forEach(playerId => {
        probabilities[playerId] = {
          winsCompetition: { probabilityToWin: 0.125 },
          lossesCompetition: { probabilityToWin: 0.125 }
        };
      });
    }
  }

  const getPlayerAchievements = (playerId: string) => {
    return achievements?.playerAchievements?.[playerId]?.earned || [];
  };

  const getHighestRarityAchievement = (playerId: string) => {
    const playerAchievements = getPlayerAchievements(playerId);
    if (playerAchievements.length === 0) return null;

    // Sort by rarity priority: legendary > epic > rare > uncommon > common
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    
    const sorted = playerAchievements.sort((a, b) => {
      const aData = achievements?.achievements?.[a.achievement];
      const bData = achievements?.achievements?.[b.achievement];
      const aRarity = aData?.rarity || 'common';
      const bRarity = bData?.rarity || 'common';
      return (rarityOrder[aRarity as keyof typeof rarityOrder] || 4) - (rarityOrder[bRarity as keyof typeof rarityOrder] || 4);
    });

    return achievements?.achievements?.[sorted[0].achievement];
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
    <>
      <div className="container-constraint">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Player Rosters</h2>
          <p className="text-secondary-text text-sm">Each player's 4 selected NFL teams and their current performance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grid-constraint">
        {Object.entries(config.players)
          .sort(([aId], [bId]) => {
            // Get the BEST probability across both competitions (wins OR losses)
            const aWinProb = probabilities[aId]?.winsCompetition?.probabilityToWin || 0;
            const aLossProb = probabilities[aId]?.lossesCompetition?.probabilityToWin || 0;
            const aBestProb = Math.max(aWinProb, aLossProb);
            
            const bWinProb = probabilities[bId]?.winsCompetition?.probabilityToWin || 0;
            const bLossProb = probabilities[bId]?.lossesCompetition?.probabilityToWin || 0;
            const bBestProb = Math.max(bWinProb, bLossProb);
            
            return bBestProb - aBestProb; // Descending order by best championship probability
          })
          .map(([playerId, player], index) => {
          const standing = standings.find(s => s.playerId === playerId);
          const currentRank = index + 1; // Position in the sorted array
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
                    <button
                      onClick={() => {
                        setExpandedPlayer(
                          expandedPlayer === playerId ? null : playerId
                        );
                      }}
                      className="achievement-badge cursor-pointer hover:scale-105 transition-transform bg-neon-green/20 border border-neon-green/50 px-2 py-1 rounded"
                    >
                      <div className="flex items-center gap-1">
                        {(() => {
                          const highestAchievement = getHighestRarityAchievement(playerId);
                          return highestAchievement ? (
                            <span className={`text-sm ${
                              highestAchievement.rarity === 'legendary' ? 'text-neon-purple' :
                              highestAchievement.rarity === 'epic' ? 'text-neon-blue' :
                              highestAchievement.rarity === 'rare' ? 'text-neon-green' :
                              'text-neon-yellow'
                            }`}>
                              {highestAchievement.icon}
                            </span>
                          ) : (
                            <Award className="w-3 h-3" />
                          );
                        })()}
                        <span className="text-xs">
                          {playerAchievements.length}
                        </span>
                        <ChevronRight className={`w-3 h-3 transition-transform ${
                          expandedPlayer === playerId ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-secondary-text">Current Rank</div>
                    <div className="font-display font-bold text-lg text-neon-green">
                      #{currentRank}
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements Dropdown */}
              {expandedPlayer === playerId && playerAchievements.length > 0 && (
                <div className="mb-4 p-4 bg-accent-bg/20 rounded-lg border border-accent-border/30">
                  <h4 className="font-semibold text-sm mb-3">🏆 Achievements ({playerAchievements.length})</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {playerAchievements.map((achievement) => {
                      const achievementData = achievements?.achievements?.[achievement.achievement];
                      if (!achievementData) return null;
                      
                      return (
                        <div
                          key={achievement.achievement}
                          className={`flex items-center gap-3 p-2 rounded border-l-2 ${
                            achievementData.rarity === 'legendary' ? 'border-neon-purple bg-neon-purple/5' :
                            achievementData.rarity === 'epic' ? 'border-neon-blue bg-neon-blue/5' :
                            achievementData.rarity === 'rare' ? 'border-neon-green bg-neon-green/5' :
                            'border-neon-yellow bg-neon-yellow/5'
                          }`}
                        >
                          <span className="text-lg">{achievementData.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{achievementData.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                achievementData.rarity === 'legendary' ? 'bg-neon-purple/20 text-neon-purple' :
                                achievementData.rarity === 'epic' ? 'bg-neon-blue/20 text-neon-blue' :
                                achievementData.rarity === 'rare' ? 'bg-neon-green/20 text-neon-green' :
                                'bg-neon-yellow/20 text-neon-yellow'
                              }`}>
                                {achievementData.rarity}
                              </span>
                            </div>
                            <p className="text-xs text-secondary-text mt-1">{achievementData.description}</p>
                            <p className="text-xs text-muted-text">{new Date(achievement.earnedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
    </>
  );
};

export default PlayerCards;