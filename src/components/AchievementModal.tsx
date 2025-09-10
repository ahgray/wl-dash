import React from 'react';
import { X, Award, Calendar } from 'lucide-react';
import { AchievementsData, PlayerAchievement } from '@/types';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerId: string;
  achievements: AchievementsData | null;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  playerName,
  playerId,
  achievements,
}) => {
  if (!isOpen || !achievements) return null;

  const playerAchievements = achievements.playerAchievements?.[playerId]?.earned || [];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-neon-purple border-neon-purple/30 bg-neon-purple/5';
      case 'epic': return 'text-neon-blue border-neon-blue/30 bg-neon-blue/5';
      case 'rare': return 'text-neon-green border-neon-green/30 bg-neon-green/5';
      case 'uncommon': return 'text-neon-yellow border-neon-yellow/30 bg-neon-yellow/5';
      default: return 'text-secondary-text border-accent-border/30 bg-accent-bg/20';
    }
  };

  const getRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 border-2 border-neon-blue rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5"></div>
          <div className="relative z-10 text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-accent-border/20">
            <div>
              <h2 className="text-xl font-bold">{playerName}'s Achievements</h2>
              <p className="text-sm text-secondary-text mt-1">
                {playerAchievements.length} achievement{playerAchievements.length !== 1 ? 's' : ''} earned
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent-bg/20 transition-colors"
              aria-label="Close achievements"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {playerAchievements.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-secondary-text/50 mx-auto mb-4" />
                <p className="text-secondary-text">No achievements earned yet</p>
                <p className="text-sm text-muted-text mt-2">
                  Keep playing to unlock achievements!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playerAchievements.map((achievement) => {
                  const achievementData = achievements.achievements?.[achievement.achievement];
                  if (!achievementData) return null;

                  return (
                    <div
                      key={achievement.achievement}
                      className={`p-4 rounded-lg border transition-all hover:scale-105 ${getRarityColor(achievementData.rarity)}`}
                    >
                      {/* Achievement Icon and Rarity */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{achievementData.icon}</div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(achievementData.rarity)}`}>
                          {getRarityLabel(achievementData.rarity)}
                        </span>
                      </div>

                      {/* Achievement Name */}
                      <h3 className="font-semibold text-base mb-2">
                        {achievementData.name}
                      </h3>

                      {/* Achievement Description */}
                      <p className="text-sm text-secondary-text mb-3">
                        {achievementData.description}
                      </p>

                      {/* Earned Date and Context */}
                      <div className="flex items-center gap-2 text-xs text-muted-text">
                        <Calendar className="w-3 h-3" />
                        <span>Earned {formatDate(achievement.earnedDate)}</span>
                      </div>
                      
                      {achievement.context && (
                        <p className="text-xs text-muted-text mt-1 italic">
                          {achievement.context}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AchievementModal;