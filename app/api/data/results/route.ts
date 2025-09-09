import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { fetchNFLData } from '@/utils/nflApi';

export async function GET() {
  try {
    // Try to fetch live NFL data first
    const liveData = await fetchNFLData();
    
    // Structure the response to match our Results interface
    const results = {
      lastUpdated: liveData.lastUpdated,
      currentWeek: liveData.currentWeek,
      gamesInProgress: [], // TODO: Implement in-progress game detection
      nextUpdate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      teams: liveData.teams
    };
    
    // Cache the results to JSON file for fallback
    const cacheFilePath = path.join(process.cwd(), 'data', 'cached-results.json');
    await fs.writeFile(cacheFilePath, JSON.stringify(results, null, 2)).catch(() => {
      // Ignore cache write errors
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching live NFL data:', error);
    
    // Fallback to cached data or sample data
    try {
      const fallbackPaths = [
        path.join(process.cwd(), 'data', 'cached-results.json'),
        path.join(process.cwd(), 'data', 'results.json')
      ];
      
      for (const filePath of fallbackPaths) {
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(fileContent);
          console.log(`Using fallback data from ${filePath}`);
          return NextResponse.json({
            ...data,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            isLiveData: false // Indicate this is fallback data
          });
        } catch (fallbackError) {
          continue; // Try next fallback
        }
      }
      
      throw new Error('No fallback data available');
    } catch (fallbackError) {
      console.error('Error reading fallback results:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to load NFL data and no fallback available' },
        { status: 500 }
      );
    }
  }
}