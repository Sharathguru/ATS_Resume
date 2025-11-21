// import { formatDistanceToNow } from "date-fns";
// import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  selectCurrentScan,
  selectResetView,
  selectStatus,
} from "../features/scan/scanSlice";
// import ScoreDial from "./ScoreDial";
// import TagList from "./TagList";

// Parse experience entry to extract company, year, and project
// const parseExperienceEntry = (entry) => {
//     if (!entry || typeof entry !== 'string') return null;
//     
//     const entryText = entry.trim();
//     
//     // Check if it indicates fresher or no experience
//     const fresherKeywords = ['fresher', 'no experience', 'fresh graduate', 'new graduate', 'entry level'];
//     const isFresher = fresherKeywords.some(keyword => 
//       entryText.toLowerCase().includes(keyword)
//     );
//     
//     if (isFresher || entryText.length === 0) return null;
//     
//     // Extract year pattern (YYYY, YYYY-YYYY, etc.)
//     const yearPattern = /(\d{4}(?:\s*[-–]\s*\d{4})?)/;
//     const yearMatch = entryText.match(yearPattern);
//     const yearText = yearMatch ? yearMatch[1].trim() : '';
//     
//     // Get text without year for parsing
//     let textWithoutYear = entryText.replace(yearPattern, '').trim();
//     
//     // Check if this looks like a project (e.g., "Wayfarer Travel – MERN Stack Project")
//     // Projects typically have tech stack names in the second part after dash
//     const projectKeywords = ['project', 'stack', 'app', 'application', 'website', 'web app', 'mern', 'react', 'node', 'frontend', 'backend'];
//     const dashMatch = textWithoutYear.match(/^(.+?)[–\-–]\s*(.+)$/);
//     
//     if (dashMatch) {
//       const afterDash = dashMatch[2].toLowerCase().trim();
//       const hasProjectKeyword = projectKeywords.some(keyword => afterDash.includes(keyword));
//       
//       // If after dash contains project-related keywords and no year, it's likely a project, not work experience
//       if (hasProjectKeyword && !yearText) {
//         return null; // Treat as project, not experience
//       }
//     }
//     
//     // If no year is found, it's likely not a real work experience
//     if (!yearText) {
//       return null;
//     }
//     
//     // Try to extract company name, year, and project/role
//     let companyName = '';
//     let project = '';
//     
//     if (dashMatch) {
//       companyName = dashMatch[1].trim();
//       project = dashMatch[2].trim();
//     } else {
//       // Just company name (with year already extracted)
//       companyName = textWithoutYear;
//     }
//     
//     // Clean up: remove extra dashes, spaces, parentheses
//     companyName = companyName.replace(/[–\-–\s]*$/, '').replace(/[\(\)]/g, '').trim();
//     project = project.replace(/^[–\-–\s]*/, '').replace(/[\(\)]/g, '').trim();
//     
//     // Only return if we have at least a company name and year
//     if (!companyName || !yearText) return null;
//     
//     return {
//       company: companyName,
//       year: yearText,
//       project: project || null,
//       raw: entryText
//     };
// };

const ResultsPanel = () => {
  const currentScan = useSelector(selectCurrentScan);
  const status = useSelector(selectStatus);
  const resetView = useSelector(selectResetView);
  const isLoading = status === "loading";

  // const breakdown = useMemo(() => {
  //   const source = currentScan || {};
  //   const experienceData = source.experience || [];
  //   
  //   // Parse experience entries
  //   const parsedExperience = experienceData
  //     .map(parseExperienceEntry)
  //     .filter(entry => entry !== null && entry.company); // Filter out null entries and entries without company
  //   
  //   // Only include Experience section if there's actual experience (not fresher)
  //   const sections = [
  //     { title: "Objective", data: source.objective ? [source.objective] : [] },
  //   ];
  //   
  //   // Add Experience only if there's valid experience data
  //   if (parsedExperience.length > 0) {
  //     sections.push({ 
  //       title: "Experience", 
  //       data: parsedExperience,
  //       isStructured: true // Flag to indicate structured rendering
  //     });
  //   }
  //   
  //   sections.push(
  //     { title: "Education", data: source.education || [] },
  //     { title: "Technical skills", data: source.skillsTechnical || [] },
  //     { title: "Soft skills", data: source.skillsSoft || [] },
  //     { title: "Projects", data: source.projects || [] }
  //   );
  //   
  //   return sections;
  // }, [currentScan]);

  const handleDownload = () => {
    if (!currentScan?.improvedResumeContent) return;
    const blob = new Blob([currentScan.improvedResumeContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const filenameBase =
      currentScan.originalFileName?.replace(/\.[^.]+$/, "") || "rewritten-resume";
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenameBase}-ATS-optimized.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // if (!currentScan && !isLoading) {
  //   return (
  //     <div className="results-panel empty-state">
  //       <div className="results-panel-body">
  //         <p className="eyebrow">Results</p>
  //         <h2>No scans yet</h2>
  //         <p className="muted-text">
  //           Upload a resume and job description to see ATS score, missing keywords, and a fully
  //           rewritten resume ready to download.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // const missingKeywords = currentScan?.missingKeywords || [];
  // const missingReasons = currentScan?.missingKeywordReasons || [];
  // const suggestions = currentScan?.rewriteSuggestions || [];
  const improvedContent = currentScan?.improvedResumeContent || "";

  if (resetView) {
    return (
      <div className="results-panel empty-state">
        <div className="results-panel-body">
          <p className="eyebrow">Results</p>
          <h2>Scan reset</h2>
          <p className="muted-text">
            Upload a resume and job description to generate a fresh rewrite and ATS score.
          </p>
        </div>
      </div>
    );
  }

  if (!currentScan && !isLoading) {
    return (
      <div className="results-panel empty-state">
        <div className="results-panel-body">
          <p className="eyebrow">Results</p>
          <h2>No scans yet</h2>
          <p className="muted-text">
            Upload a resume and job description to see the AI rewritten resume content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <div className="results-panel-body">
        {/* <div className="results-header">
          <div className="results-info">
            <div className="results-label-row">
              <p className="eyebrow">Latest scan</p>
              {currentScan?.score !== undefined && !isLoading ? (
                <span className="pill-score">{currentScan.score}%</span>
              ) : null}
            </div>
            <h2>
              {currentScan?.originalFileName || "Uploaded resume"}
            </h2>
            {currentScan?.createdAt && (
              <p className="muted-text">
                Matched against JD{" "}
                {formatDistanceToNow(new Date(currentScan.createdAt), { addSuffix: true })}
              </p>
            )}
          </div>
          <div className="results-actions">
            <button
              type="button"
              className="outline-button"
              onClick={handleDownload}
              disabled={isLoading || !currentScan?.improvedResumeContent}
            >
              Download rewritten resume
            </button>
          </div>
        </div> */}

        {/* <div className="results-grid">
          <div className="results-card score-card">
            <ScoreDial value={currentScan?.score ?? 0} isLoading={false} />
          </div>
          <div className="results-card">
            <div className="card-heading-row">
              <h3>Missing skills</h3>
              {!isLoading && missingKeywords.length ? (
                <span className="pill-score secondary">{missingKeywords.length} gaps</span>
              ) : null}
            </div>
            <TagList
              items={missingKeywords}
              emptyLabel="Impressive! Every JD keyword is covered."
            />
          </div>
          <div className="results-card">
            <h3>Rewrite suggestions</h3>
            {suggestions.length ? (
              <ul className="suggestion-list">
                {suggestions.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">
                Our AI did not find major gaps. Feel free to download the optimized resume anyway.
              </p>
            )}
          </div>
        </div> */}

        {/* <section className="resume-breakdown">
          {breakdown.map((section) => (
            <article key={section.title} className="breakdown-card">
              <h3>{section.title}</h3>
              {section.data?.length ? (
                section.isStructured && section.title === "Experience" ? (
                  <ul className="experience-list">
                    {section.data.map((exp, index) => (
                      <li key={`${section.title}-${index}`} className="experience-item">
                        <div className="experience-header">
                          {exp.company && (
                            <span className="experience-company">{exp.company}</span>
                          )}
                          {exp.project && (
                            <>
                              <span className="experience-separator"> – </span>
                              <span className="experience-project">{exp.project}</span>
                            </>
                          )}
                        </div>
                        {exp.year && (
                          <div className="experience-year">{exp.year}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul>
                    {section.data.map((line, index) => (
                      <li key={`${section.title}-${index}`}>{line}</li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="muted-text">No data extracted.</p>
              )}
            </article>
          ))}
        </section> */}

        <section className="improved-resume">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Full rewrite</p>
              <h3>AI rewritten resume content</h3>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={handleDownload}
              disabled={isLoading || !currentScan?.improvedResumeContent}
            >
              Download
            </button>
          </div>
          <pre>{improvedContent}</pre>
        </section>
      </div>
    </div>
  );
};

export default ResultsPanel;

