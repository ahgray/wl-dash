import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { generateWeeklyNarrative } from '@/utils/narrativeGenerator';
import { calculateStandings } from '@/utils/calculations';
import { fetchNFLData } from '@/utils/nflApi';

export async function GET() {
  try {
    // Load configuration
    const configPath = path.join(process.cwd(), 'config', 'players.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Get current NFL data and standings
    const nflData = await fetchNFLData();
    const standings = calculateStandings(config, nflData.teams);

    // Load existing narratives
    const narrativesPath = path.join(process.cwd(), 'data', 'narratives.json');
    let narrativesData = { narratives: {} };
    
    try {
      const narrativesContent = await fs.readFile(narrativesPath, 'utf-8');
      narrativesData = JSON.parse(narrativesContent);
    } catch {
      // No existing narratives, start fresh
    }

    // Generate narrative for current week if it doesn't exist
    const currentWeekStr = nflData.currentWeek.toString();
    
    if (!narrativesData.narratives[currentWeekStr]) {
      console.log(`Generating narrative for week ${nflData.currentWeek}...`);
      
      const newNarrative = await generateWeeklyNarrative(
        config,
        nflData.teams,
        standings.winsLeaderboard,
        nflData.currentWeek
      );

      narrativesData.narratives[currentWeekStr] = newNarrative;

      // Cache the updated narratives
      await fs.writeFile(narrativesPath, JSON.stringify(narrativesData, null, 2)).catch(() => {
        console.log('Could not cache narratives');
      });
    }

    return NextResponse.json(narrativesData);
  } catch (error) {
    console.error('Error generating narratives:', error);
    
    // Fallback to existing narratives file
    try {
      const filePath = path.join(process.cwd(), 'data', 'narratives.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({
        ...data,
        isLiveData: false
      });
    } catch (fallbackError) {
      console.error('Error reading narratives fallback:', fallbackError);
      return NextResponse.json(
        { narratives: {} }, // Return empty narratives rather than error
        { status: 200 }
      );
    }
  }
}

// POST endpoint for manually triggering narrative generation
export async function POST(request: Request) {
  try {
    const { week, forceRegenerate } = await request.json();
    
    // Load configuration
    const configPath = path.join(process.cwd(), 'config', 'players.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Get current NFL data and standings
    const nflData = await fetchNFLData();
    const standings = calculateStandings(config, nflData.teams);

    const targetWeek = week || nflData.currentWeek;
    
    // Generate new narrative
    const newNarrative = await generateWeeklyNarrative(
      config,
      nflData.teams,
      standings.winsLeaderboard,
      targetWeek
    );

    // Load and update narratives
    const narrativesPath = path.join(process.cwd(), 'data', 'narratives.json');
    let narrativesData = { narratives: {} };
    
    try {
      const narrativesContent = await fs.readFile(narrativesPath, 'utf-8');
      narrativesData = JSON.parse(narrativesContent);
    } catch {
      // No existing narratives
    }

    narrativesData.narratives[targetWeek.toString()] = newNarrative;

    // Save updated narratives
    await fs.writeFile(narrativesPath, JSON.stringify(narrativesData, null, 2));

    return NextResponse.json({ 
      success: true, 
      narrative: newNarrative,
      week: targetWeek 
    });
  } catch (error) {
    console.error('Error in POST narratives:', error);
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}