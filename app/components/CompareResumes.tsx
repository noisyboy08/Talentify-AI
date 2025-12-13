import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import Score3D from "./Score3D";

interface CompareResumesProps {
  resumeId1: string;
  resumeId2: string;
}

const CompareResumes = ({ resumeId1, resumeId2 }: CompareResumesProps) => {
  const { kv } = usePuterStore();
  const [resume1, setResume1] = useState<Resume | null>(null);
  const [resume2, setResume2] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const [data1, data2] = await Promise.all([
          kv.get(`resume:${resumeId1}`),
          kv.get(`resume:${resumeId2}`),
        ]);

        if (data1) setResume1(JSON.parse(data1) as Resume);
        if (data2) setResume2(JSON.parse(data2) as Resume);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    loadResumes();
  }, [resumeId1, resumeId2, kv]);

  if (loading) {
    return <div className="text-center p-8">Loading comparison...</div>;
  }

  if (!resume1 || !resume2) {
    return <div className="text-center p-8 text-red-500">Resumes not found</div>;
  }

  const feedback1 = resume1.feedback;
  const feedback2 = resume2.feedback;

  const compareScores = (score1: number, score2: number, label: string) => {
    const diff = score1 - score2;
    const better = diff > 0 ? "Resume 1" : diff < 0 ? "Resume 2" : "Equal";
    return { diff, better, label };
  };

  const comparisons = [
    compareScores(feedback1?.overallScore || 0, feedback2?.overallScore || 0, "Overall Score"),
    compareScores(feedback1?.ATS?.score || 0, feedback2?.ATS?.score || 0, "ATS Score"),
    compareScores(feedback1?.toneAndStyle?.score || 0, feedback2?.toneAndStyle?.score || 0, "Tone & Style"),
    compareScores(feedback1?.content?.score || 0, feedback2?.content?.score || 0, "Content"),
    compareScores(feedback1?.structure?.score || 0, feedback2?.structure?.score || 0, "Structure"),
    compareScores(feedback1?.skills?.score || 0, feedback2?.skills?.score || 0, "Skills"),
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-gradient mb-8">Resume Comparison</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume 1 */}
        <div className="card-3d glow-3d bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {resume1.companyName || resume1.jobTitle || "Resume 1"}
          </h2>
          <div className="flex justify-center mb-6">
            <Score3D score={feedback1?.overallScore || 0} size={150} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>ATS Score:</span>
              <span className="font-semibold">{feedback1?.ATS?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Tone & Style:</span>
              <span className="font-semibold">{feedback1?.toneAndStyle?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Content:</span>
              <span className="font-semibold">{feedback1?.content?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Structure:</span>
              <span className="font-semibold">{feedback1?.structure?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Skills:</span>
              <span className="font-semibold">{feedback1?.skills?.score || 0}/100</span>
            </div>
          </div>
        </div>

        {/* Resume 2 */}
        <div className="card-3d glow-3d bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {resume2.companyName || resume2.jobTitle || "Resume 2"}
          </h2>
          <div className="flex justify-center mb-6">
            <Score3D score={feedback2?.overallScore || 0} size={150} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>ATS Score:</span>
              <span className="font-semibold">{feedback2?.ATS?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Tone & Style:</span>
              <span className="font-semibold">{feedback2?.toneAndStyle?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Content:</span>
              <span className="font-semibold">{feedback2?.content?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Structure:</span>
              <span className="font-semibold">{feedback2?.structure?.score || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Skills:</span>
              <span className="font-semibold">{feedback2?.skills?.score || 0}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card-3d bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Detailed Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Category</th>
                <th className="text-center p-3">Resume 1</th>
                <th className="text-center p-3">Resume 2</th>
                <th className="text-center p-3">Difference</th>
                <th className="text-center p-3">Winner</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comp, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{comp.label}</td>
                  <td className="p-3 text-center">
                    {comp.label === "Overall Score"
                      ? feedback1?.overallScore || 0
                      : comp.label === "ATS Score"
                      ? feedback1?.ATS?.score || 0
                      : comp.label === "Tone & Style"
                      ? feedback1?.toneAndStyle?.score || 0
                      : comp.label === "Content"
                      ? feedback1?.content?.score || 0
                      : comp.label === "Structure"
                      ? feedback1?.structure?.score || 0
                      : feedback1?.skills?.score || 0}
                  </td>
                  <td className="p-3 text-center">
                    {comp.label === "Overall Score"
                      ? feedback2?.overallScore || 0
                      : comp.label === "ATS Score"
                      ? feedback2?.ATS?.score || 0
                      : comp.label === "Tone & Style"
                      ? feedback2?.toneAndStyle?.score || 0
                      : comp.label === "Content"
                      ? feedback2?.content?.score || 0
                      : comp.label === "Structure"
                      ? feedback2?.structure?.score || 0
                      : feedback2?.skills?.score || 0}
                  </td>
                  <td className="p-3 text-center">
                    <span className={comp.diff > 0 ? "text-green-600" : comp.diff < 0 ? "text-red-600" : "text-gray-600"}>
                      {comp.diff > 0 ? "+" : ""}{comp.diff.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      comp.better === "Resume 1"
                        ? "bg-green-100 text-green-700"
                        : comp.better === "Resume 2"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {comp.better}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareResumes;

