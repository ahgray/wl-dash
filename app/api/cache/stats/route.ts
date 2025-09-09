import { NextResponse } from 'next/server';
import { getCacheStats } from '@/utils/cache';

export async function GET() {
  try {
    const stats = getCacheStats();
    
    return NextResponse.json({
      ...stats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

// POST endpoint to clear cache
export async function POST(request: Request) {
  try {
    const { cache } = await import('@/utils/cache');
    const { action, key } = await request.json();
    
    if (action === 'clear') {
      if (key) {
        cache.delete(key);
        return NextResponse.json({ 
          success: true, 
          message: `Cleared cache key: ${key}` 
        });
      } else {
        cache.clear();
        return NextResponse.json({ 
          success: true, 
          message: 'Cleared all cache' 
        });
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    );
  }
}