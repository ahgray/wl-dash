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
    
    console.log('🔥 About to call Grok API...');
    // Generate narrative using Grok API
    const narrative = await callGrokAPI(context);
    console.log('✅ Grok API succeeded!');
    
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
    console.error('❌ Error generating narrative:', error);
    console.log('🔄 Using fallback narrative...');
    
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

  const OpenAI = (await import('openai')).default;
  
  const client = new OpenAI({
    baseURL: "https://api.x.ai/v1",
    apiKey: apiKey,
  });

  const prompt = buildNarrativePrompt(context);

  console.log('🚀 Making Grok API call...');
  const completion = await client.chat.completions.create({
    model: 'grok-4-0709',
    messages: [
      {
        role: 'system',
        content: 'You are a sports commentator for a fantasy NFL league with two separate competitions: one awarding a prize for most total wins, and another awarding a prize for most total losses. Write factual, entertaining narratives that mention both competitions without bias.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 800,
    temperature: 0.7
  });

  console.log('✅ Grok API response received');
  const generatedText = completion.choices[0]?.message?.content || '';

  // Parse the generated content
  return parseNarrativeResponse(generatedText);
}

function buildNarrativePrompt(context: NarrativeContext): string {
  return `Write a weekly narrative for "${context.leagueName}" Week ${context.week}.

This league has TWO competitions with separate prizes:
- MOST WINS PRIZE: Currently led by ${context.topPerformers.mostWins.playerName} with ${context.topPerformers.mostWins.totalWins} wins
- MOST LOSSES PRIZE: Currently led by ${context.topPerformers.mostLosses.playerName} with ${context.topPerformers.mostLosses.totalLosses} losses

Current standings:
${context.players.map((p, i) => 
  `${i + 1}. ${p.playerName}: ${p.totalWins}W-${p.totalLosses}L`
).join('\n')}

Write a 200-word narrative that:
1. Has an engaging title
2. Mentions both competitions and their current leaders
3. Covers other notable performances
4. Looks ahead to next week

Keep it entertaining but factual. Both competitions are legitimate ways to win prizes in this league.`;
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
  let content = lines.slice(1).join('\n\n').trim();
  
  // Remove word count from the end of the content
  content = content.replace(/\(Word count:\s*\d+\)$/i, '').trim();
  content = content.replace(/Word count:\s*\d+$/i, '').trim();

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