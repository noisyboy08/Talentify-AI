import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ResumeCard from "~/components/ResumeCard";
import Hero from "~/components/Hero";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/home";
import DisplayCards from "~/components/ui/display-cards";
import { Sparkles, BarChart3, Brain, Wand2, Layers, ShieldCheck } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talentify AI" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [error, setError] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [filterScore, setFilterScore] = useState<"all" | "high" | "medium" | "low">("all");

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      try {
      setLoadingResumes(true);
        setError("");
      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => {
        const data = JSON.parse(resume.value);
        return data as Resume;
        }) || [];
        
        // Sort resumes
        const sortedResumes = [...parsedResumes].sort((a, b) => {
          if (sortBy === "date") {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first
          } else {
            const scoreA = a.feedback?.overallScore || 0;
            const scoreB = b.feedback?.overallScore || 0;
            return scoreB - scoreA; // Highest first
          }
        });
        
        // Filter resumes by score
        const filteredResumes = sortedResumes.filter((resume) => {
          const score = resume.feedback?.overallScore || 0;
          if (filterScore === "all") return true;
          if (filterScore === "high") return score >= 70;
          if (filterScore === "medium") return score >= 50 && score < 70;
          if (filterScore === "low") return score < 50;
          return true;
        });
        
        setResumes(filteredResumes);
        setLoadingResumes(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load resumes.");
      setLoadingResumes(false);
      }
    };
    if (auth.isAuthenticated) {
    loadResumes();
    }
  }, [auth.isAuthenticated, sortBy, filterScore, kv]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      {/* Hero Section with Shader Animation - Full Screen */}
      <Hero />

      {/* Post-hero CTA */}
      <section className="main-section py-6 sm:py-10">
        <div className="page-heading">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">Ready to get hired faster?</h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">Upload your resume and let Talentify AI handle the heavy lifting.</p>
          <Link
            to="/upload"
            className="primary-button w-fit text-lg sm:text-xl font-semibold glow-3d card-3d px-6 sm:px-8 py-3 sm:py-4"
          >
            Upload Resume
          </Link>
        </div>
      </section>

      {/* Resume List / Ratings Section (moved directly after hero) */}
      <section className="main-section">
        <div className="page-heading">
          <h1 className="float-3d">Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get started.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg w-full max-w-2xl">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {resumes.length > 0 && !loadingResumes && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-center justify-center w-full max-w-4xl px-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "score")}
                  className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="date">Date (Newest)</option>
                  <option value="score">Score (Highest)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by score:</label>
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value as "all" | "high" | "medium" | "low")}
                  className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="all">All Resumes</option>
                  <option value="high">High (70+)</option>
                  <option value="medium">Medium (50-69)</option>
                  <option value="low">Low (&lt;50)</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
                Showing {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}
        {resumes.length > 0 && !loadingResumes && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold glow-3d card-3d"
            >
              Upload Resume
            </Link>
          </div>
        )}
        {resumes.length > 1 && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Compare Resumes:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {resumes.slice(0, 5).map((resume, index) => {
                if (index === resumes.length - 1) return null;
                return (
                  <Link
                    key={resume.id}
                    to={`/compare/${resume.id}/${resumes[index + 1]?.id}`}
                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-sm"
                  >
                    Compare with {resumes[index + 1]?.companyName || "Next"}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Trusted By / Social Proof */}
      <section className="main-section py-8 sm:py-12">
        <div className="page-heading">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 px-4">Trusted by top talent and teams</h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-gray-600 px-4">
            {["FAANG-ready engineers", "Product leaders", "Data scientists", "Designers", "Students"].map((item) => (
              <span key={item} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm sm:text-base">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="main-section py-8 sm:py-12 pb-20 sm:pb-32 overflow-visible">
        <div className="page-heading mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">Key Features</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl px-4">AI-powered tools to perfect your resume and land the interview.</p>
        </div>
        <div className="flex justify-center w-full overflow-visible px-4">
          <div className="w-full max-w-5xl overflow-visible">
            <DisplayCards
              cards={[
                {
                  icon: <BarChart3 className="h-4 w-4 text-blue-400" />,
                  title: "Multi-Dimensional Scoring",
                  description: "ATS compatibility, skills match, grammar clarity, formatting, impact, and consistency scoring.",
                  date: "Live",
                  iconClassName: "text-blue-500",
                  titleClassName: "text-blue-600",
                  className:
                    "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Brain className="h-4 w-4 text-indigo-400" />,
                  title: "AI Rewrite & JD Match",
                  description: "Live rewrite sections with metrics, match job description keywords, and boost ATS compatibility.",
                  date: "New",
                  iconClassName: "text-indigo-500",
                  titleClassName: "text-indigo-600",
                  className:
                    "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Wand2 className="h-4 w-4 text-purple-400" />,
                  title: "Portfolio & Versions",
                  description: "Generate portfolio website, track resume versions, compare diffs, and monitor score improvements.",
                  date: "Today",
                  iconClassName: "text-purple-500",
                  titleClassName: "text-purple-600",
                  className:
                    "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="main-section py-8 sm:py-12 bg-white/70">
        <div className="page-heading">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl px-4">
            {[
              { step: "1", title: "Upload", desc: "Upload your resume PDF or doc to start." },
              { step: "2", title: "Analyze", desc: "AI scores ATS, skills, clarity, and formatting." },
              { step: "3", title: "Improve", desc: "Auto-rewrite sections, tailor to roles, generate versions." },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-200 card-3d">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-3 text-lg">{s.step}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{s.desc}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Live Demo Preview */}
      <section className="main-section py-8 sm:py-12">
        <div className="page-heading">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">Live Demo Preview</h2>
          <p className="text-sm sm:text-base text-gray-600 px-4">See how scoring and feedback look in real time.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 w-full max-w-5xl card-3d mx-4">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
            <img src="/images/resume-scan.gif" alt="demo" className="w-full md:w-1/2 rounded-xl shadow" />
            <div className="flex-1 space-y-3 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Instant AI Insights</h3>
              <p className="text-sm sm:text-base text-gray-600">Upload a resume and watch ATS, skills match, and clarity scores update instantly with actionable tips.</p>
              <Link to="/upload" className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium">
                Try the live demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced AI Modules */}
      <section className="main-section py-8 sm:py-12 bg-white/70">
        <div className="page-heading">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">Advanced AI Modules</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-6xl px-4">
          {[
            { title: "Role Tailoring", desc: "Optimize for SWE, PM, DS, Cybersecurity, Marketing, Designer, Sales, Consultant." },
            { title: "Project Enhancer", desc: "Add metrics, impact, and keywords to project descriptions." },
            { title: "Interview Assistant", desc: "HR + technical Q&A, weak points, suggested answers, mock sessions." },
            { title: "Portfolio Generator", desc: "Generate a full portfolio site from your resume content." },
          ].map((m) => (
            <div key={m.title} className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-200 card-3d">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{m.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="main-section py-8 sm:py-12">
        <div className="page-heading">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 px-4">FAQ</h2>
        </div>
        <div className="w-full max-w-4xl flex flex-col gap-3 sm:gap-4 px-4">
          {[
            { q: "How do I get started?", a: "Upload your resume on the Upload page and let AI analyze it." },
            { q: "Can I tailor for specific roles?", a: "Yes, use Role Tailoring to optimize for SWE, PM, DS, and more." },
            { q: "Do you store my data?", a: "Resumes are stored in your account; you can delete them anytime." },
          ].map((item) => (
            <details key={item.q} className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm">
              <summary className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer py-1">{item.q}</summary>
              <p className="text-sm sm:text-base text-gray-600 mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="main-section py-6 sm:py-8">
        <div className="w-full max-w-6xl text-center text-gray-600 text-xs sm:text-sm px-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-3">
            <Link to="/activity" className="hover:text-gray-900 py-1">Activity</Link>
            <Link to="/changelog" className="hover:text-gray-900 py-1">Changelog</Link>
            <Link to="/contact" className="hover:text-gray-900 py-1">Contact</Link>
            <Link to="/upload" className="hover:text-gray-900 py-1">Upload</Link>
          </div>
          <p className="text-xs sm:text-sm">Talentify AI — Smarter resumes, faster offers.</p>
        </div>
      </section>
    </main>
  );
}
