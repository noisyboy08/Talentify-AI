import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { GitBranch, TrendingUp, TrendingDown, Clock, FileText } from "lucide-react";
import type { ResumeVersion, VersionDiff } from "~/types/features";

interface VersionControlProps {
  resumeId: string;
}

export function VersionControl({ resumeId }: VersionControlProps) {
  const { kv, fs } = usePuterStore();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);

  useEffect(() => {
    loadVersions();
  }, [resumeId]);

  const loadVersions = async () => {
    try {
      const versionsKey = `resume:${resumeId}:versions`;
      const versionsData = await kv.get(versionsKey);
      if (versionsData) {
        const parsed = JSON.parse(versionsData);
        setVersions(parsed.sort((a: ResumeVersion, b: ResumeVersion) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewVersion = async () => {
    try {
      // Get current resume data
      const resumeKey = `resume:${resumeId}`;
      const resumeData = await kv.get(resumeKey);
      if (!resumeData) {
        alert('Resume data not found');
        return;
      }

      const resume = JSON.parse(resumeData);
      const newVersion: ResumeVersion = {
        id: `version-${Date.now()}`,
        resumeId,
        version: versions.length + 1,
        createdAt: new Date().toISOString(),
        resumePath: resume.resumePath,
        score: {
          overall: resume.feedback?.overallScore || 0,
          ats: resume.feedback?.ATS?.score || 0,
          skills: resume.feedback?.skills?.score || 0,
          grammar: 0,
          formatting: resume.feedback?.structure?.score || 0,
          impact: 0,
          consistency: 0,
        },
        feedback: resume.feedback,
      };

      const updatedVersions = [...versions, newVersion];
      await kv.set(`resume:${resumeId}:versions`, JSON.stringify(updatedVersions));
      setVersions(updatedVersions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      alert('Version saved successfully!');
    } catch (error) {
      console.error('Failed to create version:', error);
      alert(`Failed to save version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const compareVersions = (v1: ResumeVersion, v2: ResumeVersion): VersionDiff[] => {
    const diffs: VersionDiff[] = [];
    
    // Compare scores
    if (v1.score.overall !== v2.score.overall) {
      diffs.push({
        section: 'Overall Score',
        type: 'modified',
        oldValue: v1.score.overall.toString(),
        newValue: v2.score.overall.toString(),
        impact: v2.score.overall > v1.score.overall ? 'positive' : 'negative',
        scoreChange: v2.score.overall - v1.score.overall,
      });
    }

    // Compare ATS score
    if (v1.score.ats !== v2.score.ats) {
      diffs.push({
        section: 'ATS Score',
        type: 'modified',
        oldValue: v1.score.ats.toString(),
        newValue: v2.score.ats.toString(),
        impact: v2.score.ats > v1.score.ats ? 'positive' : 'negative',
        scoreChange: v2.score.ats - v1.score.ats,
      });
    }

    return diffs;
  };

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-2xl shadow-lg">
        <div className="animate-pulse">Loading versions...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Version Control</h2>
        </div>
        <button
          onClick={createNewVersion}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation text-sm sm:text-base"
        >
          Save Current Version
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No versions saved yet.</p>
          <p className="text-sm mt-2">Save your first version to start tracking improvements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedVersion?.id === version.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVersion(version)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-bold text-blue-600">v{version.version}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Version {version.version}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(version.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {version.score.overall}
                  </div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                  {index > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {version.score.overall > versions[index - 1].score.overall ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">
                            +{version.score.overall - versions[index - 1].score.overall}
                          </span>
                        </>
                      ) : version.score.overall < versions[index - 1].score.overall ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-600">
                            {version.score.overall - versions[index - 1].score.overall}
                          </span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">ATS</div>
                  <div className="text-lg font-bold text-gray-900">{version.score.ats}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Skills</div>
                  <div className="text-lg font-bold text-gray-900">{version.score.skills}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Grammar</div>
                  <div className="text-lg font-bold text-gray-900">{version.score.grammar}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Format</div>
                  <div className="text-lg font-bold text-gray-900">{version.score.formatting}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Impact</div>
                  <div className="text-lg font-bold text-gray-900">{version.score.impact}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Consistency</div>
                  <div className="text-lg font-bold text-gray-900">{version.score.consistency}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Comparison View */}
          {selectedVersion && versions.length > 1 && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Version Comparison</h3>
              {versions
                .filter((v) => v.id !== selectedVersion.id)
                .slice(0, 1)
                .map((compareVersion) => {
                  const diffs = compareVersions(compareVersion, selectedVersion);
                  return (
                    <div key={compareVersion.id} className="space-y-2">
                      <div className="text-sm text-gray-600 mb-3">
                        Comparing v{compareVersion.version} → v{selectedVersion.version}
                      </div>
                      {diffs.map((diff, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border-l-4 ${
                            diff.impact === 'positive'
                              ? 'bg-green-50 border-green-500'
                              : diff.impact === 'negative'
                              ? 'bg-red-50 border-red-500'
                              : 'bg-gray-50 border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{diff.section}</span>
                            <span
                              className={`font-bold ${
                                diff.impact === 'positive'
                                  ? 'text-green-600'
                                  : diff.impact === 'negative'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {diff.scoreChange > 0 ? '+' : ''}
                              {diff.scoreChange}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {diff.oldValue} → {diff.newValue}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

