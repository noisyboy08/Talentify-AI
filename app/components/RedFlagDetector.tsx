import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import type { RedFlag } from "~/types/scoring";

interface RedFlagDetectorProps {
  resumeId: string;
}

export function RedFlagDetector({ resumeId }: RedFlagDetectorProps) {
  const { ai, kv, fs } = usePuterStore();
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRedFlags = async () => {
      try {
        setLoading(true);

        const resumeData = await kv.get(`resume:${resumeId}`);
        if (!resumeData) {
          setLoading(false);
          return;
        }

        const resume = JSON.parse(resumeData);
        const resumeBlob = await fs.read(resume.resumePath);
        if (!resumeBlob) {
          setLoading(false);
          return;
        }

        const detectionPrompt = `Analyze this resume for potential red flags that could cause it to be rejected by recruiters or ATS systems.

Check for:
1. Length issues (too short < 1 page, too long > 2 pages)
2. Missing dates (employment dates, education dates)
3. Missing achievements (no quantified results)
4. Irrelevant skills (skills not matching the role)
5. Poor formatting (inconsistent, unprofessional)
6. Content issues (grammar errors, typos, unclear descriptions)

For each red flag found, provide:
- type: 'critical' (must fix), 'warning' (should fix), or 'info' (nice to have)
- category: 'length' | 'dates' | 'achievements' | 'skills' | 'formatting' | 'content'
- title: Short title of the issue
- description: Detailed explanation
- suggestion: How to fix it
- icon: Appropriate icon name

Return as JSON array:
[
  {
    "type": "critical" | "warning" | "info",
    "category": "length" | "dates" | "achievements" | "skills" | "formatting" | "content",
    "title": string,
    "description": string,
    "suggestion": string,
    "icon": string
  }
]

Return ONLY the JSON array, no other text.`;

        const result = await ai.feedback(resume.resumePath, detectionPrompt);

        if (!result) {
          setLoading(false);
          return;
        }

        const resultText =
          typeof result.message.content === "string"
            ? result.message.content
            : result.message.content[0].text;

        const cleanedText = resultText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const parsedFlags = JSON.parse(cleanedText) as RedFlag[];
        setRedFlags(parsedFlags);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    detectRedFlags();
  }, [resumeId, ai, kv, fs]);

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "alert":
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
      case "critical":
        return <XCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: RedFlag["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-300 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-300 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-300 text-blue-800";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (redFlags.length === 0) {
    return (
      <div className="card-3d bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Red Flag Detection</h2>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">
            ✓ No critical red flags detected! Your resume looks good.
          </p>
        </div>
      </div>
    );
  }

  const criticalFlags = redFlags.filter((f) => f.type === "critical");
  const warningFlags = redFlags.filter((f) => f.type === "warning");
  const infoFlags = redFlags.filter((f) => f.type === "info");

  return (
    <div className="card-3d bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold">Red Flag Detection</h2>
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
          {redFlags.length} Issues Found
        </span>
      </div>

      <div className="space-y-4">
        {/* Critical Flags */}
        {criticalFlags.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-700 mb-2">
              Critical Issues ({criticalFlags.length})
            </h3>
            <div className="space-y-2">
              {criticalFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${getTypeStyles(flag.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(flag.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{flag.title}</h4>
                      <p className="text-sm mb-2">{flag.description}</p>
                      <div className="bg-white/50 rounded p-2 mt-2">
                        <p className="text-xs font-semibold mb-1">Suggestion:</p>
                        <p className="text-sm">{flag.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Flags */}
        {warningFlags.length > 0 && (
          <div>
            <h3 className="font-semibold text-yellow-700 mb-2">
              Warnings ({warningFlags.length})
            </h3>
            <div className="space-y-2">
              {warningFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${getTypeStyles(flag.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(flag.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{flag.title}</h4>
                      <p className="text-sm mb-2">{flag.description}</p>
                      <div className="bg-white/50 rounded p-2 mt-2">
                        <p className="text-xs font-semibold mb-1">Suggestion:</p>
                        <p className="text-sm">{flag.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Flags */}
        {infoFlags.length > 0 && (
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">
              Suggestions ({infoFlags.length})
            </h3>
            <div className="space-y-2">
              {infoFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${getTypeStyles(flag.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(flag.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{flag.title}</h4>
                      <p className="text-sm mb-2">{flag.description}</p>
                      <div className="bg-white/50 rounded p-2 mt-2">
                        <p className="text-xs font-semibold mb-1">Suggestion:</p>
                        <p className="text-sm">{flag.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

