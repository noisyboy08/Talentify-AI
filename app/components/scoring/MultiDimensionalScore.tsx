import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { RadialChart } from "./RadialChart";
import { ScoreCard } from "./ScoreCard";
import type { MultiDimensionalScore as MultiScore } from "~/types/scoring";
import { BarChart3, AlertCircle, RefreshCw } from "lucide-react";

interface MultiDimensionalScoreProps {
  resumeId: string;
  jobDescription?: string;
}

export function MultiDimensionalScore({ resumeId, jobDescription }: MultiDimensionalScoreProps) {
  const { ai, kv, fs } = usePuterStore();
  const [scores, setScores] = useState<MultiScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const analyzeResume = async () => {
      try {
        setLoading(true);
        setError("");

        // Get resume data
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

        // Enhanced AI prompt for multi-dimensional analysis
        const analysisPrompt = `You are an expert resume analyst. Analyze this resume comprehensively across multiple dimensions.

Provide a detailed analysis with scores (0-100) for each dimension:

1. ATS Compatibility Score: How well does this resume pass through Applicant Tracking Systems?
   - Check for proper formatting, keywords, structure
   - Look for ATS-friendly elements

2. Skills Match Score: How well do the skills match the job description?
   ${jobDescription ? `Job Description: ${jobDescription}` : "No job description provided - analyze general skill relevance"}
   - Match required skills
   - Identify missing skills
   - Assess skill relevance

3. Grammar & Clarity Score: How clear and error-free is the writing?
   - Grammar, spelling, punctuation
   - Sentence structure
   - Clarity and readability

4. Formatting Score: How professional is the formatting?
   - Consistency
   - Visual hierarchy
   - Professional appearance
   - Proper spacing and alignment

5. Impact Score: How impactful are the achievements and descriptions?
   - Use of action verbs
   - Quantification of results
   - Achievement highlights
   - Results-oriented language

6. Consistency Score: Are there any contradictions or inconsistencies?
   - Date consistency
   - Information consistency
   - No conflicting information

For each dimension, provide:
- score (0-100)
- feedback (array of specific points)
- tips (array of improvement suggestions with type: 'critical' | 'important' | 'suggestion')
- strengths (array of what's working well)
- weaknesses (array of what needs improvement)

Return the analysis as a JSON object matching this structure:
{
  "atsCompatibility": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "skillsMatch": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "grammarClarity": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "formatting": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "impact": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "consistency": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "overall": number
}

Return ONLY the JSON object, no other text.`;

        const analysis = await ai.feedback(resume.resumePath, analysisPrompt);

        if (!analysis) {
          setError("Failed to analyze resume");
          setLoading(false);
          return;
        }

        const analysisText =
          typeof analysis.message.content === "string"
            ? analysis.message.content
            : analysis.message.content[0]?.text || "";

        if (!analysisText) {
          setError("No response from AI. Please try again.");
          setLoading(false);
          return;
        }

        // Clean and parse JSON
        let cleanedText = analysisText
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
          const parsedScores = JSON.parse(cleanedText) as MultiScore;
          
          // Validate and set defaults for missing fields
          const validatedScores: MultiScore = {
            atsCompatibility: parsedScores.atsCompatibility || {
              score: 0,
              maxScore: 100,
              feedback: [],
              tips: [],
              strengths: [],
              weaknesses: [],
            },
            skillsMatch: parsedScores.skillsMatch || {
              score: 0,
              maxScore: 100,
              feedback: [],
              tips: [],
              strengths: [],
              weaknesses: [],
            },
            grammarClarity: parsedScores.grammarClarity || {
              score: 0,
              maxScore: 100,
              feedback: [],
              tips: [],
              strengths: [],
              weaknesses: [],
            },
            formatting: parsedScores.formatting || {
              score: 0,
              maxScore: 100,
              feedback: [],
              tips: [],
              strengths: [],
              weaknesses: [],
            },
            impact: parsedScores.impact || {
              score: 0,
              maxScore: 100,
              feedback: [],
              tips: [],
              strengths: [],
              weaknesses: [],
            },
            consistency: parsedScores.consistency || {
              score: 0,
              maxScore: 100,
              feedback: [],
              tips: [],
              strengths: [],
              weaknesses: [],
            },
            overall: parsedScores.overall || 0,
          };

          setScores(validatedScores);
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

    analyzeResume();
  }, [resumeId, jobDescription, ai, kv, fs]);

  const handleRetry = () => {
    setError("");
    setScores(null);
    setLoading(true);
    // Trigger re-analysis by updating a dependency
    const analyzeResume = async () => {
      try {
        setLoading(true);
        setError("");

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

        const analysisPrompt = `You are an expert resume analyst. Analyze this resume comprehensively across multiple dimensions.

Provide a detailed analysis with scores (0-100) for each dimension:

1. ATS Compatibility Score: How well does this resume pass through Applicant Tracking Systems?
   - Check for proper formatting, keywords, structure
   - Look for ATS-friendly elements

2. Skills Match Score: How well do the skills match the job description?
   ${jobDescription ? `Job Description: ${jobDescription}` : "No job description provided - analyze general skill relevance"}
   - Match required skills
   - Identify missing skills
   - Assess skill relevance

3. Grammar & Clarity Score: How clear and error-free is the writing?
   - Grammar, spelling, punctuation
   - Sentence structure
   - Clarity and readability

4. Formatting Score: How professional is the formatting?
   - Consistency
   - Visual hierarchy
   - Professional appearance
   - Proper spacing and alignment

5. Impact Score: How impactful are the achievements and descriptions?
   - Use of action verbs
   - Quantification of results
   - Achievement highlights
   - Results-oriented language

6. Consistency Score: Are there any contradictions or inconsistencies?
   - Date consistency
   - Information consistency
   - No conflicting information

For each dimension, provide:
- score (0-100)
- feedback (array of specific points)
- tips (array of improvement suggestions with type: 'critical' | 'important' | 'suggestion')
- strengths (array of what's working well)
- weaknesses (array of what needs improvement)

Return the analysis as a JSON object matching this structure:
{
  "atsCompatibility": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "skillsMatch": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "grammarClarity": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "formatting": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "impact": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "consistency": { "score": number, "feedback": [], "tips": [], "strengths": [], "weaknesses": [] },
  "overall": number
}

Return ONLY the JSON object, no other text.`;

        const analysis = await ai.feedback(resume.resumePath, analysisPrompt);

        if (!analysis) {
          setError("Failed to analyze resume");
          setLoading(false);
          return;
        }

        const analysisText =
          typeof analysis.message.content === "string"
            ? analysis.message.content
            : analysis.message.content[0]?.text || "";

        if (!analysisText) {
          setError("No response from AI. Please try again.");
          setLoading(false);
          return;
        }

        let cleanedText = analysisText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/^[^{]*/, "")
          .replace(/[^}]*$/, "")
          .trim();

        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }

        const parsedScores = JSON.parse(cleanedText) as MultiScore;
        const validatedScores: MultiScore = {
          atsCompatibility: parsedScores.atsCompatibility || {
            score: 0,
            maxScore: 100,
            feedback: [],
            tips: [],
            strengths: [],
            weaknesses: [],
          },
          skillsMatch: parsedScores.skillsMatch || {
            score: 0,
            maxScore: 100,
            feedback: [],
            tips: [],
            strengths: [],
            weaknesses: [],
          },
          grammarClarity: parsedScores.grammarClarity || {
            score: 0,
            maxScore: 100,
            feedback: [],
            tips: [],
            strengths: [],
            weaknesses: [],
          },
          formatting: parsedScores.formatting || {
            score: 0,
            maxScore: 100,
            feedback: [],
            tips: [],
            strengths: [],
            weaknesses: [],
          },
          impact: parsedScores.impact || {
            score: 0,
            maxScore: 100,
            feedback: [],
            tips: [],
            strengths: [],
            weaknesses: [],
          },
          consistency: parsedScores.consistency || {
            score: 0,
            maxScore: 100,
            feedback: [],
            tips: [],
            strengths: [],
            weaknesses: [],
          },
          overall: parsedScores.overall || 0,
        };

        setScores(validatedScores);
        setLoading(false);
      } catch (err) {
        console.error("Retry Analysis Error:", err);
        setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
        setLoading(false);
      }
    };
    analyzeResume();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 animate-fade-in-scale">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <BarChart3 className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Analyzing resume across multiple dimensions...</p>
        <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fade-in-scale">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Analysis Error</p>
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scores) {
    return null;
  }

  const scoreCategories = [
    { key: "atsCompatibility", label: "ATS Compatibility", color: "blue" },
    { key: "skillsMatch", label: "Skills Match", color: "green" },
    { key: "grammarClarity", label: "Grammar & Clarity", color: "purple" },
    { key: "formatting", label: "Formatting", color: "orange" },
    { key: "impact", label: "Impact", color: "pink" },
    { key: "consistency", label: "Consistency", color: "indigo" },
  ] as const;

  return (
    <div className="w-full space-y-6 animate-slide-up">
      {/* Overall Score */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover-lift">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Overall Multi-Dimensional Score</h2>
            <p className="text-sm text-gray-500">Comprehensive analysis across 6 key dimensions</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${
              scores.overall >= 80 ? 'text-green-600' :
              scores.overall >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {scores.overall}
            </div>
            <div className="text-sm text-gray-500">/ 100</div>
            <p className={`text-xs mt-1 font-medium ${
              scores.overall >= 80 ? 'text-green-600' :
              scores.overall >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {scores.overall >= 80 ? 'Excellent' :
               scores.overall >= 60 ? 'Good' :
               'Needs Work'}
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className={`h-5 rounded-full transition-all duration-1000 ease-out ${
              scores.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              scores.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${scores.overall}%` }}
          ></div>
        </div>
      </div>

      {/* Radial Charts Grid */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Score Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {scoreCategories.map((category, index) => {
            const scoreData = scores[category.key];
            return (
              <div
                key={category.key}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RadialChart
                  score={scoreData.score}
                  label={category.label}
                  color={category.color}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Score Cards */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Detailed Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {scoreCategories.map((category, index) => {
            const scoreData = scores[category.key];
            return (
              <div
                key={category.key}
                className="animate-slide-up animate-delay-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ScoreCard
                  title={category.label}
                  score={scoreData.score}
                  feedback={scoreData.feedback}
                  tips={scoreData.tips}
                  strengths={scoreData.strengths}
                  weaknesses={scoreData.weaknesses}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

