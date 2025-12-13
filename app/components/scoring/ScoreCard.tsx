import { AlertCircle, CheckCircle, Info, Lightbulb } from "lucide-react";
import type { ImprovementTip } from "~/types/scoring";

interface ScoreCardProps {
  title: string;
  score: number;
  feedback: string[];
  tips: ImprovementTip[];
  strengths: string[];
  weaknesses: string[];
}

export function ScoreCard({
  title,
  score,
  feedback,
  tips,
  strengths,
  weaknesses,
}: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className={`bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 hover-lift transition-all ${getScoreBg(score)}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-700">Strengths</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {strengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h4 className="font-semibold text-red-700">Areas for Improvement</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {weaknesses.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <h4 className="font-semibold text-yellow-700">Improvement Tips</h4>
          </div>
          <div className="space-y-2">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg text-sm ${
                  tip.type === "critical"
                    ? "bg-red-100 border border-red-300"
                    : tip.type === "important"
                    ? "bg-yellow-100 border border-yellow-300"
                    : "bg-blue-100 border border-blue-300"
                }`}
              >
                <p className="font-semibold">{tip.title}</p>
                <p className="text-gray-700">{tip.description}</p>
                {tip.example && (
                  <p className="text-xs text-gray-600 mt-1 italic">
                    Example: {tip.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

