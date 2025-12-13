import { useEffect, useState } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { Activity, FileText, TrendingUp, Clock, ArrowRight } from "lucide-react";
import type { Route } from "./+types/activity";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI | Activity" },
    { name: "description", content: "View your resume activity and history" },
  ];
}

interface ActivityItem {
  id: string;
  type: 'upload' | 'analyze' | 'improve' | 'version';
  title: string;
  description: string;
  timestamp: string;
  score?: number;
  resumeId?: string;
}

export default function ActivityPage() {
  const { kv, auth } = usePuterStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    improvements: 0,
    versions: 0,
  });

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    loadActivities();
  }, [auth.isAuthenticated]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Get all resumes
      const resumeKeys = await kv.list('resume:*', true) as any[];
      const resumes = (resumeKeys || [])
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
        .filter((r: any) => r);

      // Get all versions
      const versionKeys = await kv.list('resume:*:versions', true) as any[];
      const allVersions: any[] = [];
      
      if (versionKeys) {
        for (const key of versionKeys) {
          const versionsData = await kv.get(key);
          if (versionsData) {
            try {
              const versions = JSON.parse(versionsData);
              allVersions.push(...(Array.isArray(versions) ? versions : []));
            } catch {}
          }
        }
      }

      // Build activity feed
      const activityList: ActivityItem[] = [];

      // Add resume uploads
      resumes.forEach((resume: any) => {
        if (resume.createdAt) {
          activityList.push({
            id: `upload-${resume.id}`,
            type: 'upload',
            title: `Uploaded Resume${resume.jobTitle ? ` for ${resume.jobTitle}` : ''}`,
            description: resume.companyName || 'New resume uploaded',
            timestamp: resume.createdAt,
            score: resume.feedback?.overallScore,
            resumeId: resume.id,
          });
        }

        // Add analysis activity
        if (resume.feedback) {
          activityList.push({
            id: `analyze-${resume.id}`,
            type: 'analyze',
            title: 'Resume Analyzed',
            description: `Score: ${resume.feedback.overallScore || 0}/100`,
            timestamp: resume.createdAt || new Date().toISOString(),
            score: resume.feedback.overallScore,
            resumeId: resume.id,
          });
        }
      });

      // Add version activities
      allVersions.forEach((version: any) => {
        activityList.push({
          id: `version-${version.id}`,
          type: 'version',
          title: `Version ${version.version} Created`,
          description: `Score: ${version.score?.overall || 0}/100`,
          timestamp: version.createdAt,
          score: version.score?.overall,
          resumeId: version.resumeId,
        });
      });

      // Sort by timestamp (newest first)
      activityList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activityList);

      // Calculate stats
      const scores = resumes
        .map((r: any) => r.feedback?.overallScore || 0)
        .filter((s: number) => s > 0);
      
      setStats({
        totalResumes: resumes.length,
        averageScore: scores.length > 0 
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0,
        improvements: allVersions.length,
        versions: allVersions.length,
      });
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return <FileText className="w-5 h-5" />;
      case 'analyze':
        return <Activity className="w-5 h-5" />;
      case 'improve':
        return <TrendingUp className="w-5 h-5" />;
      case 'version':
        return <Clock className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return 'bg-blue-100 text-blue-600';
      case 'analyze':
        return 'bg-purple-100 text-purple-600';
      case 'improve':
        return 'bg-green-100 text-green-600';
      case 'version':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">Loading activities...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Activity</h1>
          </div>
          <p className="text-gray-600">Track your resume activity and improvements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Total Resumes</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalResumes}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Average Score</div>
            <div className="text-3xl font-bold text-blue-600">{stats.averageScore}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Versions Created</div>
            <div className="text-3xl font-bold text-orange-600">{stats.versions}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Total Activities</div>
            <div className="text-3xl font-bold text-purple-600">{activities.length}</div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm mt-2">Upload a resume to see your activity feed</p>
                <Link
                  to="/upload"
                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Upload Resume
                </Link>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{activity.description}</p>
                      {activity.score !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Score:</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                            {activity.score}/100
                          </span>
                        </div>
                      )}
                    </div>
                    {activity.resumeId && (
                      <Link
                        to={`/resume/${activity.resumeId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        View
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

