import { useState, useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import type { JobDescriptionAnalysis } from "~/types/scoring";
import { FileText, CheckCircle2, AlertCircle, Copy, Sparkles } from "lucide-react";

export function JobDescriptionAnalyzer({ resumeId }: { resumeId: string }) {
  const { ai, kv, fs } = usePuterStore();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Load saved job description if exists
  useEffect(() => {
    const loadSavedJD = async () => {
      try {
        const resumeData = await kv.get(`resume:${resumeId}`);
        if (resumeData) {
          const resume = JSON.parse(resumeData);
          if (resume.jobDescription) {
            setJobDescription(resume.jobDescription);
            setSaved(true);
          }
        }
      } catch (err) {
        // Ignore errors when loading
      }
    };
    if (resumeId) {
      loadSavedJD();
    }
  }, [resumeId, kv]);

  const handleSaveJD = async () => {
    if (!jobDescription.trim()) return;
    
    try {
      const resumeData = await kv.get(`resume:${resumeId}`);
      if (resumeData) {
        const resume = JSON.parse(resumeData);
        resume.jobDescription = jobDescription;
        await kv.set(`resume:${resumeId}`, JSON.stringify(resume));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save job description:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const resumeData = await kv.get(`resume:${resumeId}`);
      if (!resumeData) {
        setError("Resume not found");
        setLoading(false);
        return;
      }

      const resume = JSON.parse(resumeData);
      const resumeBlob = await fs.read(resume.resumePath);
      if (!resumeBlob) {
        setError("Failed to load resume");
        setLoading(false);
        return;
      }

      // Save job description to resume data
      resume.jobDescription = jobDescription;
      await kv.set(`resume:${resumeId}`, JSON.stringify(resume));

      const analysisPrompt = `Analyze this job description and compare it with the provided resume.

Extract and analyze:
1. Required Skills: List all technical and soft skills mentioned as required
2. Optional Skills: List skills mentioned as "preferred" or "nice to have"
3. Missing Keywords: Keywords from JD that are missing in the resume
4. Match Percentage: Calculate how well the resume matches (0-100%)
5. Suggested Bullets: For each experience/project, suggest improved bullet points that:
   - Include JD keywords
   - Add quantification
   - Use stronger action verbs
   - Are more relevant to the role

Return as JSON:
{
  "requiredSkills": string[],
  "optionalSkills": string[],
  "missingKeywords": string[],
  "matchPercentage": number,
  "suggestedBullets": [
    {
      "original": string,
      "improved": string,
      "reason": string,
      "metrics": string (optional)
    }
  ],
  "extractedRequirements": string[]
}

Job Description:
${jobDescription}

Return ONLY the JSON object, no other text.`;

      const result = await ai.feedback(resume.resumePath, analysisPrompt);

      if (!result) {
        setError("Analysis failed");
        setLoading(false);
        return;
      }

      const resultText =
        typeof result.message.content === "string"
          ? result.message.content
          : result.message.content[0]?.text || "";

      if (!resultText) {
        setError("No response from AI. Please try again.");
        setLoading(false);
        return;
      }

      // Clean up the response text
      let cleanedText = resultText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/^[^{]*/, "") // Remove any text before first {
        .replace(/[^}]*$/, "") // Remove any text after last }
        .trim();

      // Try to find JSON object if wrapped in text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      try {
        const parsedAnalysis = JSON.parse(cleanedText) as JobDescriptionAnalysis;
        
        // Validate and set defaults for missing fields
        const validatedAnalysis: JobDescriptionAnalysis = {
          requiredSkills: parsedAnalysis.requiredSkills || [],
          optionalSkills: parsedAnalysis.optionalSkills || [],
          missingKeywords: parsedAnalysis.missingKeywords || [],
          matchPercentage: parsedAnalysis.matchPercentage || 0,
          suggestedBullets: parsedAnalysis.suggestedBullets || [],
          extractedRequirements: parsedAnalysis.extractedRequirements || [],
        };

        setAnalysis(validatedAnalysis);
        setLoading(false);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Cleaned Text:", cleanedText);
        setError("Failed to parse AI response. The AI might have returned invalid JSON. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show temporary feedback
      const button = event?.currentTarget;
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span class="text-green-600">✓ Copied!</span>';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover-lift animate-slide-up">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Job Description Analyzer</h2>
          <p className="text-xs sm:text-sm text-gray-500">Compare your resume with job requirements</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Paste Job Description
          </label>
          {saved && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved</span>
            </div>
          )}
        </div>
          <textarea
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setSaved(false);
          }}
          placeholder="Paste the job description here...\n\nExample:\n- Required: 3+ years of React experience\n- Preferred: TypeScript, Node.js\n- Responsibilities: Build scalable web applications..."
          className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y text-sm sm:text-base"
          rows={8}
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={handleSaveJD}
            disabled={!jobDescription.trim() || saved}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            Save JD
          </button>
          <div className="text-xs text-gray-500 flex items-center">
            {jobDescription.length} characters
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !jobDescription.trim()}
        className="w-full primary-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 touch-manipulation"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Job Description</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in-scale">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="mt-6 space-y-6 animate-slide-up animate-delay-200">
          {/* Match Percentage */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-semibold text-gray-800">Match Percentage</span>
                <p className="text-sm text-gray-600 mt-1">How well your resume matches the job</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-blue-600">
                  {analysis.matchPercentage}%
                </span>
                <p className={`text-xs mt-1 ${
                  analysis.matchPercentage >= 70 ? 'text-green-600' : 
                  analysis.matchPercentage >= 50 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {analysis.matchPercentage >= 70 ? 'Excellent Match' : 
                   analysis.matchPercentage >= 50 ? 'Good Match' : 
                   'Needs Improvement'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-3 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                  analysis.matchPercentage >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  analysis.matchPercentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${analysis.matchPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Required Skills */}
          {analysis.requiredSkills.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  Required Skills ({analysis.requiredSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional Skills */}
          {analysis.optionalSkills && analysis.optionalSkills.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">
                  Preferred Skills ({analysis.optionalSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.optionalSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {analysis.missingKeywords.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">
                  Missing Keywords ({analysis.missingKeywords.length})
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                These keywords from the job description are missing from your resume. Consider adding them to improve your match score.
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Bullets */}
          {analysis.suggestedBullets.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 text-lg">
                  Suggested Improvements ({analysis.suggestedBullets.length})
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                AI-suggested improvements to make your resume more aligned with the job description.
              </p>
              <div className="space-y-4">
                {analysis.suggestedBullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original</p>
                        <button
                          onClick={(e) => copyToClipboard(bullet.original, e)}
                          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{bullet.original}</p>
                    </div>
                    <div className="mb-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Improved</p>
                        <button
                          onClick={(e) => copyToClipboard(bullet.improved, e)}
                          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <p className="text-gray-900 font-medium leading-relaxed">{bullet.improved}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mt-3">
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-semibold">Why:</span> {bullet.reason}
                      </p>
                      {bullet.metrics && (
                        <p className="text-xs text-blue-700 mt-2 font-medium">
                          💡 Metrics suggestion: {bullet.metrics}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Requirements */}
          {analysis.extractedRequirements && analysis.extractedRequirements.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Key Requirements Extracted</h3>
              <ul className="space-y-2">
                {analysis.extractedRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

