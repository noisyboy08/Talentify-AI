import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/feebdack/ATS";
import Details from "~/components/feebdack/Details";
import Summary from "~/components/feebdack/Summary";
import Score3D from "~/components/Score3D";
import KeywordExtractor from "~/components/KeywordExtractor";
import { MultiDimensionalScore } from "~/components/scoring/MultiDimensionalScore";
import { JobDescriptionAnalyzer } from "~/components/JobDescriptionAnalyzer";
import { RedFlagDetector } from "~/components/RedFlagDetector";
import { AutoRewrite } from "~/components/AutoRewrite";
import { VersionControl } from "~/components/VersionControl";
import { RoleTailoring } from "~/components/RoleTailoring";
import { ProjectEnhancer } from "~/components/ProjectEnhancer";
import { InterviewAssistant } from "~/components/InterviewAssistant";
import { PortfolioGenerator } from "~/components/PortfolioGenerator";
import { usePuterStore } from "~/lib/puter";
import { Sparkles, GitBranch, Target, Rocket, MessageSquare, Globe } from "lucide-react";
import type { Route } from "./+types/resume";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI | Resume Review" },
    { name: "description", content: "A detailed overview of your resume" },
  ];
}

const ResumePage = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("analysis");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading, auth.isAuthenticated, navigate, id]);

  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoading(true);
        setError("");
        const resume = await kv.get(`resume:${id}`);
        if (!resume) {
          setError("Resume not found.");
          setLoading(false);
          return;
        }
        const data = JSON.parse(resume) as Resume;
        setResumeData(data);
        
        const resumeBlob = await fs.read(data.resumePath);
        if (!resumeBlob) {
          setError("Failed to load resume file.");
          setLoading(false);
          return;
        }
        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        const resumeUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(resumeUrl);
        
        const imageBlob = await fs.read(data.imagePath);
        if (!imageBlob) {
          setError("Failed to load resume image.");
          setLoading(false);
          return;
        }
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);
        setFeedback(data.feedback);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load resume.");
        setLoading(false);
      }
    };
    if (id) {
      loadResume();
    }
  }, [id, fs, kv]);

  const handleExportReport = () => {
    if (!feedback || !resumeData) return;
    
    const report = {
      resumeId: resumeData.id,
      companyName: resumeData.companyName || "N/A",
      jobTitle: resumeData.jobTitle || "N/A",
      analyzedAt: resumeData.createdAt || new Date().toISOString(),
      overallScore: feedback.overallScore,
      atsScore: feedback.ATS.score,
      categories: {
        toneAndStyle: feedback.toneAndStyle,
        content: feedback.content,
        structure: feedback.structure,
        skills: feedback.skills,
      },
      atsTips: feedback.ATS.tips,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talentify-ai-report-${resumeData.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteResume = async () => {
    if (!id || !resumeData) return;
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }
    
    try {
      await fs.delete(resumeData.resumePath);
      await fs.delete(resumeData.imagePath);
      await kv.delete(`resume:${id}`);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resume.");
    }
  };

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button text-xs sm:text-sm">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 font-semibold">
            <span className="hidden sm:inline">Back to Homepage</span>
            <span className="sm:hidden">Back</span>
          </span>
        </Link>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={handleExportReport}
            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold touch-manipulation"
            disabled={!feedback}
          >
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button
            onClick={handleDeleteResume}
            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors text-xs sm:text-sm font-semibold touch-manipulation"
          >
            Delete
          </button>
        </div>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover lg:h-[100vh] sticky top-0 items-center justify-center w-1/3 max-lg:w-full">
          {imageUrl && resumeUrl && (
            <div className="gradient-border max-sm:m-0 h-[80%] max-2xl:h-fit w-full max-w-md mx-auto">
              <a href={resumeUrl} target="_blank">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl max-h-[600px]"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>
        <section className="feedback-section flex-1">
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="animate-slide-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl !text-black font-bold mb-3 sm:mb-4 px-2 sm:px-0">Resume Review</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in-scale">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 animate-fade-in-scale">
                <img src="/images/resume-scan-2.gif" className="w-full max-w-md" />
                <p className="text-gray-500 mt-4">Loading resume analysis...</p>
              </div>
            ) : feedback ? (
              <div className="flex flex-col gap-8">
                {/* Job Information Section */}
                {resumeData && (
                  <section className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover-lift animate-slide-up animate-delay-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {resumeData.companyName && resumeData.jobTitle
                        ? `${resumeData.companyName} - ${resumeData.jobTitle}`
                        : resumeData.companyName || resumeData.jobTitle || "Resume"}
                    </h3>
                    {resumeData.createdAt && (
                      <p className="text-sm text-gray-500">
                        Analyzed on {new Date(resumeData.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </section>
                )}
              
                {/* Overall Score Section */}
                <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover-lift animate-slide-up animate-delay-200">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Overall Score</h2>
                  <div className="flex justify-center">
                    <div className="animate-fade-in-scale animate-delay-300">
                      <Score3D score={feedback.overallScore || 0} size={200} />
                    </div>
                  </div>
                </section>

                {/* Summary Section */}
                <section className="animate-slide-up animate-delay-300">
                  <Summary feedback={feedback} />
                </section>

                {/* ATS Score Section */}
                <section className="animate-slide-up animate-delay-400">
                  <ATS
                    score={feedback.ATS.score || 0}
                    suggestions={feedback.ATS.tips || []}
                  />
                </section>
              
                {/* Multi-Dimensional Analysis Section */}
                {id && (
                  <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover-lift animate-slide-up animate-delay-400">
                    <h2 className="text-2xl font-bold mb-4">Multi-Dimensional Analysis</h2>
                    <MultiDimensionalScore 
                      resumeId={id} 
                      jobDescription={resumeData?.jobDescription} 
                    />
                  </section>
                )}

                {/* Job Description Analyzer Section */}
                {id && (
                  <section className="animate-slide-up animate-delay-500">
                    <JobDescriptionAnalyzer resumeId={id} />
                  </section>
                )}

                {/* Red Flag Detection Section */}
                {id && (
                  <section className="animate-slide-up animate-delay-500">
                    <RedFlagDetector resumeId={id} />
                  </section>
                )}
              
                {/* Keyword Analysis Section */}
                {resumeData?.jobDescription && (
                  <section className="animate-slide-up animate-delay-500">
                    <KeywordExtractor jobDescription={resumeData.jobDescription} />
                  </section>
                )}
              
                {/* Details Section */}
                <section className="animate-slide-up animate-delay-500">
                  <Details feedback={feedback} />
                </section>

                {/* Advanced Features Section */}
                <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover-lift animate-slide-up animate-delay-500">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Advanced Features</h2>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4 overflow-x-auto">
                    {[
                      { id: 'analysis', label: 'Analysis', icon: null, shortLabel: 'Analysis' },
                      { id: 'rewrite', label: 'AI Rewrite', icon: Sparkles, shortLabel: 'Rewrite' },
                      { id: 'versions', label: 'Versions', icon: GitBranch, shortLabel: 'Versions' },
                      { id: 'tailoring', label: 'Role Tailoring', icon: Target, shortLabel: 'Tailor' },
                      { id: 'projects', label: 'Project Enhancer', icon: Rocket, shortLabel: 'Projects' },
                      { id: 'interview', label: 'Interview Prep', icon: MessageSquare, shortLabel: 'Interview' },
                      { id: 'portfolio', label: 'Portfolio', icon: Globe, shortLabel: 'Portfolio' },
                    ].map((tab, index) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                        }`}
                        style={{
                          animation: `fadeInScale 0.4s ease-out ${index * 0.05}s both`
                        }}
                      >
                        {tab.icon && <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300" />}
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.shortLabel}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 animate-fade-in-scale">
                    {activeTab === 'rewrite' && id && resumeData?.resumePath && (
                      <div className="animate-slide-up">
                        <AutoRewrite resumeId={id} resumePath={resumeData.resumePath} />
                      </div>
                    )}
                    {activeTab === 'versions' && id && (
                      <div className="animate-slide-up">
                        <VersionControl resumeId={id} />
                      </div>
                    )}
                    {activeTab === 'tailoring' && id && resumeData?.resumePath && (
                      <div className="animate-slide-up">
                        <RoleTailoring resumeId={id} resumePath={resumeData.resumePath} />
                      </div>
                    )}
                    {activeTab === 'projects' && id && (
                      <div className="animate-slide-up">
                        <ProjectEnhancer resumeId={id} />
                      </div>
                    )}
                    {activeTab === 'interview' && id && resumeData?.resumePath && (
                      <div className="animate-slide-up">
                        <InterviewAssistant resumeId={id} resumePath={resumeData.resumePath} />
                      </div>
                    )}
                    {activeTab === 'portfolio' && id && resumeData?.resumePath && (
                      <div className="animate-slide-up">
                        <PortfolioGenerator resumeId={id} resumePath={resumeData.resumePath} />
                      </div>
                    )}
                    {activeTab === 'analysis' && (
                      <div className="text-center text-gray-500 py-8 animate-fade-in-scale">
                        <p>Analysis view is shown above. Use the tabs to access advanced features.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ) : !error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <img src="/images/resume-scan-2.gif" className="w-full max-w-md" />
                <p className="text-gray-500 mt-4">No feedback available</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResumePage;
