import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { calculateAchievements } from '@/utils/achievements';
import { calculateStandings } from '@/utils/calculations';
import { fetchNFLData } from '@/utils/nflApi';

export async function GET() {
  try {
    const { withCache, CacheKeys, generateConfigHash } = await import('@/utils/cache');
    
    // Load required data
    const configPath = path.join(process.cwd(), 'config', 'players.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Get current NFL data and calculate standings
    const nflData = await fetchNFLData();
    const standings = calculateStandings(config, nflData.teams);
    
    const configHash = generateConfigHash(config);
    const cacheKey = CacheKeys.ACHIEVEMENTS(configHash, nflData.currentWeek);

    const achievements = await withCache(
      cacheKey,
      async () => {
        // Load previous achievements for continuity
        const achievementsPath = path.join(process.cwd(), 'data', 'achievements.json');
        let previousAchievements = null;
        try {
          const achievementsContent = await fs.readFile(achievementsPath, 'utf-8');
          previousAchievements = JSON.parse(achievementsContent);
        } catch {
          // No previous achievements, start fresh
        }

        // Calculate current achievements
        const calculated = calculateAchievements(
          config,
          nflData.teams,
          standings.winsLeaderboard,
          nflData.currentWeek,
          previousAchievements
        );

        // Cache the calculated achievements
        await fs.writeFile(achievementsPath, JSON.stringify(calculated, null, 2)).catch(() => {
          // Ignore cache write errors
        });

        return calculated;
      },
      15 // Cache achievements for 15 minutes
    );

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error calculating achievements:', error);
    
    // Fallback to existing achievements file
    try {
      const filePath = path.join(process.cwd(), 'data', 'achievements.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({
        ...data,
        lastCalculated: data.lastCalculated || new Date().toISOString(),
        isLiveData: false
      });
    } catch (fallbackError) {
      console.error('Error reading achievements fallback:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to load achievements' },
        { status: 500 }
      );
    }
  }
}