import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ResumeHealth } from "~/types/features";

export function ResumeHealthWidget() {
  const { kv } = usePuterStore();
  const [health, setHealth] = useState<ResumeHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      // Get all resumes
      const resumeKeys = await kv.list('resume:*', true) as KVItem[] | string[];
      if (!resumeKeys || resumeKeys.length === 0) {
        setHealth({
          overall: 0,
          trend: 'stable',
          change: 0,
          breakdown: [],
        });
        setLoading(false);
        return;
      }

      // Handle both string[] and KVItem[] formats
      const resumes = (resumeKeys as any[])
        .map((item: any) => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch {
              return null;
            }
          } else if (item && item.value) {
            try {
              return JSON.parse(item.value);
            } catch {
              return null;
            }
          }
          return null;
        })
        .filter((r: any) => r && r.feedback);

      if (resumes.length === 0) {
        setHealth({
          overall: 0,
          trend: 'stable',
          change: 0,
          breakdown: [],
        });
        setLoading(false);
        return;
      }

      // Calculate average scores
      const overallScores = resumes.map((r: any) => r.feedback?.overallScore || 0);
      const avgOverall = overallScores.reduce((a: number, b: number) => a + b, 0) / overallScores.length;

      // Calculate category averages
      const categories = [
        { name: 'ATS', key: 'ATS' },
        { name: 'Skills', key: 'skills' },
        { name: 'Content', key: 'content' },
        { name: 'Structure', key: 'structure' },
        { name: 'Tone', key: 'toneAndStyle' },
      ];

      const breakdown = categories.map((cat) => {
        const scores = resumes
          .map((r: any) => r.feedback?.[cat.key]?.score || 0)
          .filter((s: number) => s > 0);
        const avg = scores.length > 0 
          ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length 
          : 0;
        
        return {
          category: cat.name,
          score: Math.round(avg),
          trend: 'stable' as const,
        };
      });

      // Determine trend (simplified - compare with previous average if available)
      const trend: 'up' | 'down' | 'stable' = 'stable';
      const change = 0;

      setHealth({
        overall: Math.round(avgOverall),
        trend,
        change,
        breakdown,
      });
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const TrendIcon = health.trend === 'up' ? TrendingUp : 
                    health.trend === 'down' ? TrendingDown : Minus;
  const trendColor = health.trend === 'up' ? 'text-green-600' :
                     health.trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-6 h-6 text-red-500" />
        <h3 className="text-xl font-bold text-gray-900">Resume Health</h3>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="text-5xl font-bold text-gray-900">{health.overall}</div>
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full transition-all"
              style={{ width: `${health.overall}%` }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={trendColor}>
              {health.change !== 0 && (health.change > 0 ? '+' : '')}
              {health.change} from last check
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 mb-2">Category Breakdown</div>
        {health.breakdown.map((item: { category: string; score: number; trend: 'up' | 'down' | 'stable' }, idx: number) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.category}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-10 text-right">
                {item.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

