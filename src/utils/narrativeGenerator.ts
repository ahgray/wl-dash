import { LeagueConfig, TeamRecord, PlayerStanding, Narrative } from '@/types';

export interface NarrativeContext {
  week: number;
  season: number;
  leagueName: string;
  players: PlayerStanding[];
  topPerformers: {
    mostWins: PlayerStanding;
    mostLosses: PlayerStanding;
    bestWinRate: PlayerStanding;
    worstWinRate: PlayerStanding;
  };
  weekHighlights: {
    biggestUpset?: string;
    perfectWeeks?: string[];
    disasterWeeks?: string[];
    tightRaces?: string;
  };
}

export async function generateWeeklyNarrative(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  standings: PlayerStanding[],
  week: number
): Promise<Narrative> {
  try {
    // Analyze the week's data
    const context = analyzeWeekData(config, teams, standings, week);
    
    // Generate narrative using Grok API
    const narrative = await callGrokAPI(context);
    
    return {
      title: narrative.title,
      content: narrative.content,
      highlights: narrative.highlights || [],
      author: 'AI Narrator',
      publishDate: new Date().toISOString().split('T')[0],
      week: week,
      season: config.season
    };
  } catch (error) {
    console.error('Error generating narrative:', error);
    
    // Fallback to template-based narrative
    return generateFallbackNarrative(config, teams, standings, week);
  }
}

function analyzeWeekData(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  standings: PlayerStanding[],
  week: number
): NarrativeContext {
  // Sort standings
  const sortedByWins = [...standings].sort((a, b) => b.totalWins - a.totalWins);
  const sortedByLosses = [...standings].sort((a, b) => b.totalLosses - a.totalLosses);
  const sortedByWinRate = [...standings].sort((a, b) => b.winPercentage - a.winPercentage);

  // Find interesting storylines
  const weekHighlights: NarrativeContext['weekHighlights'] = {};
  
  // Detect perfect weeks (all 4 teams won)
  const perfectWeeks = standings.filter(player => {
    const playerTeams = config.players[player.playerId]?.teams || [];
    return playerTeams.every(abbr => teams[abbr]?.lastGame?.result === 'W');
  }).map(p => p.playerName);

  // Detect disaster weeks (all 4 teams lost)
  const disasterWeeks = standings.filter(player => {
    const playerTeams = config.players[player.playerId]?.teams || [];
    return playerTeams.every(abbr => teams[abbr]?.lastGame?.result === 'L');
  }).map(p => p.playerName);

  if (perfectWeeks.length > 0) weekHighlights.perfectWeeks = perfectWeeks;
  if (disasterWeeks.length > 0) weekHighlights.disasterWeeks = disasterWeeks;

  // Check for tight races
  const winDifference = sortedByWins[0]?.totalWins - sortedByWins[1]?.totalWins;
  if (winDifference <= 2) {
    weekHighlights.tightRaces = `The wins competition is extremely tight with only ${winDifference} wins separating first and second place!`;
  }

  return {
    week,
    season: config.season,
    leagueName: config.leagueName,
    players: standings,
    topPerformers: {
      mostWins: sortedByWins[0],
      mostLosses: sortedByLosses[0],
      bestWinRate: sortedByWinRate[0],
      worstWinRate: sortedByWinRate[sortedByWinRate.length - 1]
    },
    weekHighlights
  };
}

async function callGrokAPI(context: NarrativeContext): Promise<{
  title: string;
  content: string;
  highlights?: string[];
}> {
  const apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey) {
    throw new Error('Grok API key not configured');
  }

  const prompt = buildNarrativePrompt(context);

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a witty sports commentator writing weekly updates for a fantasy NFL league. Write engaging, entertaining narratives that capture the drama and excitement of the competition. Use humor and personality while staying factual about the data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.choices?.[0]?.message?.content || '';

  // Parse the generated content
  return parseNarrativeResponse(generatedText);
}

function buildNarrativePrompt(context: NarrativeContext): string {
  return `Write a weekly narrative for "${context.leagueName}" fantasy NFL league, Week ${context.week} of the ${context.season} season.

Current Standings:
${context.players.map((p, i) => 
  `${i + 1}. ${p.playerName}: ${p.totalWins}W-${p.totalLosses}L (${(p.winPercentage * 100).toFixed(1)}%)`
).join('\n')}

Key Storylines:
- ${context.topPerformers.mostWins.playerName} leads in total wins (${context.topPerformers.mostWins.totalWins})
- ${context.topPerformers.mostLosses.playerName} leads in total losses (${context.topPerformers.mostLosses.totalLosses})
${context.weekHighlights.perfectWeeks ? `- Perfect weeks achieved by: ${context.weekHighlights.perfectWeeks.join(', ')}` : ''}
${context.weekHighlights.disasterWeeks ? `- Disaster weeks suffered by: ${context.weekHighlights.disasterWeeks.join(', ')}` : ''}
${context.weekHighlights.tightRaces ? `- ${context.weekHighlights.tightRaces}` : ''}

Write a compelling 2-3 paragraph narrative with:
1. A catchy title (on first line)
2. Opening paragraph setting the scene
3. Key developments and storylines
4. Looking ahead commentary

Keep it fun, engaging, and around 200-300 words total.`;
}

function parseNarrativeResponse(text: string): {
  title: string;
  content: string;
  highlights?: string[];
} {
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('Empty response from Grok API');
  }

  const title = lines[0].replace(/^#+\s*/, '').trim();
  const content = lines.slice(1).join('\n\n').trim();

  return {
    title: title || 'Weekly Update',
    content: content || 'No narrative content generated.'
  };
}

function generateFallbackNarrative(
  config: LeagueConfig,
  teams: Record<string, TeamRecord>,
  standings: PlayerStanding[],
  week: number
): Narrative {
  const leader = standings[0];
  const trailer = standings[standings.length - 1];
  
  const title = `Week ${week}: ${leader.playerName} Takes The Lead!`;
  
  const content = `Week ${week} of the ${config.season} ${config.leagueName} season has concluded with ${leader.playerName} sitting atop the wins leaderboard with ${leader.totalWins} victories. 

The competition remains fierce as teams battle for supremacy in both the wins and losses competitions. ${leader.playerName} currently holds a ${leader.totalWins - (standings[1]?.totalWins || 0)} win advantage over second place.

Meanwhile, the losses competition sees its own drama unfolding. Every week brings new surprises as NFL teams deliver unexpected results, keeping our fantasy managers on their toes.

Looking ahead, with ${18 - week} weeks remaining in the regular season, there's still plenty of time for dramatic shifts in the standings. Will ${leader.playerName} maintain their lead, or will another competitor mount a comeback charge?`;

  return {
    title,
    content,
    highlights: [
      `${leader.playerName} leads with ${leader.totalWins} wins`,
      `${trailer.playerName} needs to turn things around`,
      `${18 - week} weeks remaining in the season`
    ],
    author: 'Fantasy Bot',
    publishDate: new Date().toISOString().split('T')[0],
    week,
    season: config.season
  };
}