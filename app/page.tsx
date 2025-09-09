'use client';

import { useEffect, useState } from 'react';
import { LeagueConfig, Results, History, AchievementsData, NarrativesData } from '@/types';
import Leaderboards from '@/components/Leaderboards';
import PlayerCards from '@/components/PlayerCards';
import StatsDisplay from '@/components/StatsDisplay';
import WeeklyNarrative from '@/components/WeeklyNarrative';
import { calculateStandings } from '@/utils/calculations';

export default function Dashboard() {
  const [config, setConfig] = useState<LeagueConfig | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [narratives, setNarratives] = useState<NarrativesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data files
      const [configRes, resultsRes, historyRes, achievementsRes, narrativesRes] = await Promise.all([
        fetch('/api/data/config'),
        fetch('/api/data/results'),
        fetch('/api/data/history'),
        fetch('/api/data/achievements'),
        fetch('/api/data/narratives'),
      ]);

      if (!configRes.ok) throw new Error('Failed to load configuration');
      
      const configData = await configRes.json();
      const resultsData = resultsRes.ok ? await resultsRes.json() : null;
      const historyData = historyRes.ok ? await historyRes.json() : null;
      const achievementsData = achievementsRes.ok ? await achievementsRes.json() : null;
      const narrativesData = narrativesRes.ok ? await narrativesRes.json() : null;

      setConfig(configData);
      setResults(resultsData);
      setHistory(historyData);
      setAchievements(achievementsData);
      setNarratives(narrativesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until client has mounted
  if (!hasMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neon-red mb-4">{error || 'Failed to load configuration'}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 bg-neon-blue hover:bg-neon-blue/80 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const standings = results?.teams ? calculateStandings(config, results.teams) : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-blur sticky top-0 z-50">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                {config.leagueName}
              </h1>
              <p className="text-secondary-text text-sm mt-1">
                Season {config.season} • Week {results?.currentWeek || 0}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadData}
                className="btn-ghost"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weekly Narrative */}
        {narratives?.narratives?.[results?.currentWeek?.toString() || ''] && (
          <div className="mb-8">
            <WeeklyNarrative
              narrative={narratives.narratives[results?.currentWeek?.toString() || '']}
              week={results?.currentWeek || 0}
            />
          </div>
        )}

        {/* Dual Leaderboards */}
        {standings && (
          <div className="mb-8">
            <Leaderboards
              winsLeaderboard={standings.winsLeaderboard}
              lossesLeaderboard={standings.lossesLeaderboard}
              config={config}
              teams={results?.teams || {}}
            />
          </div>
        )}

        {/* Stats Display */}
        {results?.teams && (
          <div className="mb-8">
            <StatsDisplay
              config={config}
              teams={results.teams}
              currentWeek={results.currentWeek}
            />
          </div>
        )}

        {/* Player Cards Grid */}
        {standings && (
          <div className="mb-8">
            <PlayerCards
              config={config}
              teams={results?.teams || {}}
              standings={standings.winsLeaderboard}
              achievements={achievements}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-muted-text text-sm">
            Last updated: {results?.lastUpdated ? new Date(results.lastUpdated).toLocaleString() : 'Never'}
          </p>
        </div>
      </footer>
    </div>
  );
}