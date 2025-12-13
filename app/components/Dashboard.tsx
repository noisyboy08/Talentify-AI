import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link } from "react-router";

interface DashboardStats {
  totalResumes: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: { range: string; count: number }[];
  recentResumes: Resume[];
}

const Dashboard = () => {
  const { kv } = usePuterStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const resumes = (await kv.list("resume:*", true)) as KVItem[];
        const parsedResumes = resumes?.map((resume) => {
          const data = JSON.parse(resume.value);
          return data as Resume;
        }) || [];

        const scores = parsedResumes
          .map((r) => r.feedback?.overallScore || 0)
          .filter((s) => s > 0);

        const averageScore =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        const scoreDistribution = [
          { range: "90-100", count: scores.filter((s) => s >= 90).length },
          { range: "80-89", count: scores.filter((s) => s >= 80 && s < 90).length },
          { range: "70-79", count: scores.filter((s) => s >= 70 && s < 80).length },
          { range: "60-69", count: scores.filter((s) => s >= 60 && s < 70).length },
          { range: "0-59", count: scores.filter((s) => s < 60).length },
        ];

        const recentResumes = parsedResumes
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);

        setStats({
          totalResumes: parsedResumes.length,
          averageScore,
          highestScore: scores.length > 0 ? Math.max(...scores) : 0,
          lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
          scoreDistribution,
          recentResumes,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    loadStats();
  }, [kv]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-gradient mb-8">Dashboard</h1>

      {/* Stats Cards with 3D Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-3d glow-3d bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Resumes</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalResumes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>

        <div className="card-3d glow-3d bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-green-600">{stats.averageScore}/100</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="card-3d glow-3d bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Highest Score</p>
              <p className="text-3xl font-bold text-purple-600">{stats.highestScore}/100</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        <div className="card-3d glow-3d bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Lowest Score</p>
              <p className="text-3xl font-bold text-orange-600">{stats.lowestScore}/100</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="card-3d bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Score Distribution</h2>
        <div className="space-y-4">
          {stats.scoreDistribution.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium">{item.range}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{
                    width: `${stats.totalResumes > 0 ? (item.count / stats.totalResumes) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <div className="w-12 text-sm font-semibold">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Resumes */}
      <div className="card-3d bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Recent Resumes</h2>
        <div className="space-y-3">
          {stats.recentResumes.length > 0 ? (
            stats.recentResumes.map((resume) => (
              <Link
                key={resume.id}
                to={`/resume/${resume.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold">
                    {resume.companyName || resume.jobTitle || "Resume"}
                  </p>
                  {resume.createdAt && (
                    <p className="text-sm text-gray-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {resume.feedback?.overallScore || 0}/100
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No resumes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

