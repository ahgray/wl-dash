import React, { useState } from 'react';
import { Narrative } from '@/types';
import { MessageSquare, Share2, ChevronDown, ChevronUp } from 'lucide-react';

interface WeeklyNarrativeProps {
  narrative: Narrative;
  week: number;
}

const WeeklyNarrative: React.FC<WeeklyNarrativeProps> = ({ narrative, week }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: narrative.title,
        text: narrative.socialShareText,
      });
    } else {
      navigator.clipboard.writeText(narrative.socialShareText);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="leaderboard-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-neon-purple" />
          <div>
            <h2 className="text-xl font-bold">{narrative.title}</h2>
            <p className="text-sm text-secondary-text">Week {week} Narrative</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Share narrative"
        >
          <Share2 className="w-5 h-5 text-secondary-text hover:text-primary-text" />
        </button>
      </div>

      <div className={`prose prose-invert max-w-none ${!isExpanded ? 'line-clamp-3' : ''}`}>
        <p className="text-primary-text leading-relaxed">{narrative.content}</p>
      </div>

      {narrative.content.length > 200 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-1 text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {isExpanded && narrative.highlights && narrative.highlights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-sm font-semibold text-secondary-text uppercase tracking-wide mb-3">
            Week Highlights
          </h3>
          <ul className="space-y-2">
            {narrative.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-neon-purple mt-1">•</span>
                <span className="text-sm text-primary-text/80">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isExpanded && narrative.nextWeekPreview && (
        <div className="mt-4 p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
          <h4 className="text-sm font-semibold text-neon-blue mb-1">Next Week Preview</h4>
          <p className="text-sm text-primary-text/80">{narrative.nextWeekPreview}</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyNarrative;