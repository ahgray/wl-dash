import { NextResponse } from 'next/server';
import { fetchNFLData } from '@/utils/nflApi';
import { calculateStandings } from '@/utils/calculations';
import { generateWeeklyNarrative } from '@/utils/narrativeGenerator';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting scheduled cache refresh...');
    
    // Load configuration
    const configPath = path.join(process.cwd(), 'config', 'players.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Clear relevant caches to force fresh data
    const { cache, CacheKeys } = await import('@/utils/cache');
    cache.delete(CacheKeys.NFL_DATA);

    // Fetch fresh NFL data
    const nflData = await fetchNFLData();
    console.log(`Refreshed NFL data for week ${nflData.currentWeek}`);

    // Refresh standings
    const standings = calculateStandings(config, nflData.teams);
    console.log(`Calculated standings for ${standings.winsLeaderboard.length} players`);

    // Generate narrative if needed
    const narrativesPath = path.join(process.cwd(), 'data', 'narratives.json');
    let narrativesData = { narratives: {} };
    
    try {
      const narrativesContent = await fs.readFile(narrativesPath, 'utf-8');
      narrativesData = JSON.parse(narrativesContent);
    } catch {
      // No existing narratives
    }

    const currentWeekStr = nflData.currentWeek.toString();
    if (!narrativesData.narratives[currentWeekStr]) {
      console.log(`Generating narrative for week ${nflData.currentWeek}`);
      
      const newNarrative = await generateWeeklyNarrative(
        config,
        nflData.teams,
        standings.winsLeaderboard,
        nflData.currentWeek
      );

      narrativesData.narratives[currentWeekStr] = newNarrative;
      await fs.writeFile(narrativesPath, JSON.stringify(narrativesData, null, 2));
      console.log('Generated new weekly narrative');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      week: nflData.currentWeek,
      playersCount: standings.winsLeaderboard.length,
      message: 'Cache refreshed successfully'
    });
  } catch (error) {
    console.error('Error during cache refresh:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cache refresh failed',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow manual refresh via POST
export async function POST() {
  return GET();
}