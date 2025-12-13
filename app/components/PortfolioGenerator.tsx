import { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Globe, Loader2, Download, Eye } from "lucide-react";
import type { PortfolioData, PortfolioExperience, PortfolioProject, PortfolioEducation } from "~/types/features";

interface PortfolioGeneratorProps {
  resumeId: string;
  resumePath: string;
}

export function PortfolioGenerator({ resumeId, resumePath }: PortfolioGeneratorProps) {
  const { ai, fs } = usePuterStore();
  const [loading, setLoading] = useState(false);
  const [portfolioHtml, setPortfolioHtml] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  const generatePortfolio = async () => {
    setLoading(true);
    setPortfolioHtml(null);
    setPortfolioData(null);

    try {
      const prompt = `Extract resume data from ${resumePath} and generate a complete portfolio website.

Extract:
- Name, title, contact info
- Summary
- Skills
- Experience (with dates, descriptions, achievements)
- Projects (with technologies, descriptions, links)
- Education

Return JSON:
{
  "name": "Full Name",
  "title": "Job Title",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "description": ["bullet1", "bullet2"],
      "achievements": ["achievement1"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Description",
      "technologies": ["tech1", "tech2"],
      "link": "url",
      "github": "github url",
      "highlights": ["highlight1"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree",
      "field": "Field of Study",
      "year": "YYYY",
      "gpa": "GPA"
    }
  ],
  "socialLinks": {
    "linkedin": "linkedin url",
    "github": "github url",
    "website": "website url"
  }
}`;

      const response = await ai.feedback(resumePath, prompt);
      
      if (!response || !response.message) {
        throw new Error('No response from AI');
      }

      const content = typeof response.message.content === 'string'
        ? response.message.content
        : response.message.content[0]?.text || '';

      if (!content) {
        throw new Error('Empty response from AI');
      }

      // Clean and extract JSON
      let cleanedText = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      try {
        const data = JSON.parse(cleanedText) as PortfolioData;
        
        // Validate and set defaults
        const validatedData: PortfolioData = {
          name: data.name || 'Your Name',
          title: data.title || 'Professional Title',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          summary: data.summary || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          education: Array.isArray(data.education) ? data.education : [],
          socialLinks: data.socialLinks || {},
        };
        
        setPortfolioData(validatedData);
        
        // Generate HTML
        const html = generatePortfolioHTML(validatedData);
        setPortfolioHtml(html);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('Portfolio generation error:', error);
      alert(`Failed to generate portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolioHTML = (data: PortfolioData): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name} - Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    h1 { font-size: 3em; margin-bottom: 10px; }
    .title { font-size: 1.5em; opacity: 0.9; margin-bottom: 20px; }
    .contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
    .contact a { color: white; text-decoration: none; }
    section { background: white; margin: 30px 0; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h2 { color: #667eea; margin-bottom: 20px; font-size: 2em; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; }
    .experience-item, .project-item { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .experience-item:last-child, .project-item:last-child { border-bottom: none; }
    .company, .project-name { font-size: 1.3em; font-weight: bold; color: #333; }
    .role { color: #667eea; font-size: 1.1em; margin: 5px 0; }
    .date { color: #666; font-size: 0.9em; }
    ul { margin-left: 20px; margin-top: 10px; }
    li { margin: 5px 0; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .tech-tag { background: #f0f0f0; padding: 5px 12px; border-radius: 15px; font-size: 0.85em; }
    .links { margin-top: 10px; }
    .links a { color: #667eea; text-decoration: none; margin-right: 15px; }
    .links a:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      h1 { font-size: 2em; }
      section { padding: 20px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${data.name}</h1>
    <div class="title">${data.title}</div>
    <div class="contact">
      ${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : ''}
      ${data.phone ? `<a href="tel:${data.phone}">${data.phone}</a>` : ''}
      ${data.location ? `<span>${data.location}</span>` : ''}
    </div>
    ${data.socialLinks ? `
      <div class="contact" style="margin-top: 15px;">
        ${data.socialLinks.linkedin ? `<a href="${data.socialLinks.linkedin}" target="_blank">LinkedIn</a>` : ''}
        ${data.socialLinks.github ? `<a href="${data.socialLinks.github}" target="_blank">GitHub</a>` : ''}
        ${data.socialLinks.website ? `<a href="${data.socialLinks.website}" target="_blank">Website</a>` : ''}
      </div>
    ` : ''}
  </header>

  <div class="container">
    ${data.summary ? `
      <section>
        <h2>About</h2>
        <p>${data.summary}</p>
      </section>
    ` : ''}

    ${data.skills && data.skills.length > 0 ? `
      <section>
        <h2>Skills</h2>
        <div class="skills">
          ${data.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
        </div>
      </section>
    ` : ''}

    ${data.experience && data.experience.length > 0 ? `
      <section>
        <h2>Experience</h2>
        ${data.experience.map((exp: PortfolioExperience) => `
          <div class="experience-item">
            <div class="company">${exp.company}</div>
            <div class="role">${exp.role}</div>
            <div class="date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
            <ul>
              ${exp.description.map((desc: string) => `<li>${desc}</li>`).join('')}
            </ul>
            ${exp.achievements && exp.achievements.length > 0 ? `
              <div style="margin-top: 10px;">
                <strong>Achievements:</strong>
                <ul>
                  ${exp.achievements?.map((ach: string) => `<li>${ach}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
    ` : ''}

    ${data.projects && data.projects.length > 0 ? `
      <section>
        <h2>Projects</h2>
        ${data.projects.map((project: PortfolioProject) => `
          <div class="project-item">
            <div class="project-name">${project.name}</div>
            <p>${project.description}</p>
            <div class="project-tech">
              ${project.technologies.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            ${project.highlights && project.highlights.length > 0 ? `
              <ul>
                ${project.highlights.map((highlight: string) => `<li>${highlight}</li>`).join('')}
              </ul>
            ` : ''}
            <div class="links">
              ${project.link ? `<a href="${project.link}" target="_blank">Live Demo</a>` : ''}
              ${project.github ? `<a href="${project.github}" target="_blank">GitHub</a>` : ''}
            </div>
          </div>
        `).join('')}
      </section>
    ` : ''}

    ${data.education && data.education.length > 0 ? `
      <section>
        <h2>Education</h2>
        ${data.education?.map((edu: PortfolioEducation) => `
          <div class="experience-item">
            <div class="company">${edu.institution}</div>
            <div class="role">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
            <div class="date">${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
          </div>
        `).join('')}
      </section>
    ` : ''}
  </div>
</body>
</html>`;
  };

  const downloadPortfolio = async () => {
    if (!portfolioHtml) return;

    try {
      const blob = new Blob([portfolioHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${resumeId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download portfolio');
    }
  };

  const previewPortfolio = () => {
    if (!portfolioHtml) return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(portfolioHtml);
      newWindow.document.close();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Portfolio Generator</h2>
      </div>

      <div className="space-y-6">
        <p className="text-gray-600">
          Automatically generate a professional portfolio website from your resume.
        </p>

        {!portfolioHtml ? (
          <button
            onClick={generatePortfolio}
            disabled={loading}
            className="w-full primary-gradient text-white py-3 sm:py-4 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg touch-manipulation active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Portfolio...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                Generate Portfolio Website
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Portfolio Generated Successfully!</h3>
              <p className="text-sm text-gray-600">
                Your portfolio website is ready. Preview it or download the HTML file.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={previewPortfolio}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                Preview
              </button>
              <button
                onClick={downloadPortfolio}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Download HTML</span>
                <span className="sm:hidden">Download</span>
              </button>
            </div>

            {portfolioData && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Portfolio Data</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div><strong>Name:</strong> {portfolioData.name}</div>
                  <div><strong>Title:</strong> {portfolioData.title}</div>
                  <div><strong>Skills:</strong> {portfolioData.skills?.length || 0} skills</div>
                  <div><strong>Experience:</strong> {portfolioData.experience?.length || 0} positions</div>
                  <div><strong>Projects:</strong> {portfolioData.projects?.length || 0} projects</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

