import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectCurrentScan, selectStatus } from "../features/scan/scanSlice";
import ScoreDial from "./ScoreDial";
import TagList from "./TagList";

const ResultsPanel = () => {
  const currentScan = useSelector(selectCurrentScan);
  const status = useSelector(selectStatus);
  const isLoading = status === "loading";

  const breakdown = useMemo(() => {
    const source = currentScan || {};
    return [
      { title: "Objective", data: source.objective ? [source.objective] : [] },
      { title: "Experience", data: source.experience || [] },
      { title: "Education", data: source.education || [] },
      { title: "Technical skills", data: source.skillsTechnical || [] },
      { title: "Soft skills", data: source.skillsSoft || [] },
      { title: "Projects", data: source.projects || [] },
    ];
  }, [currentScan]);

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

  if (!currentScan && !isLoading) {
    return (
      <div className="results-panel empty-state">
        <div className="results-panel-body">
          <p className="eyebrow">Results</p>
          <h2>No scans yet</h2>
          <p className="muted-text">
            Upload a resume and job description to see ATS score, missing keywords, and a fully
            rewritten resume ready to download.
          </p>
        </div>
      </div>
    );
  }

  const missingKeywords = currentScan?.missingKeywords || [];
  const missingReasons = currentScan?.missingKeywordReasons || [];
  const suggestions = currentScan?.rewriteSuggestions || [];
  const improvedContent =
    currentScan?.improvedResumeContent ||
    (isLoading ? "Generating your ATS-optimized resume…" : "");

  return (
    <div className="results-panel">
      <div className="results-panel-body">
        <div className="results-header">
          <div className="results-info">
            <div className="results-label-row">
              <p className="eyebrow">Latest scan</p>
              {currentScan?.score !== undefined && !isLoading ? (
                <span className="pill-score">{currentScan.score}%</span>
              ) : null}
            </div>
            <h2>
              {currentScan?.originalFileName || (isLoading ? "Scanning resume…" : "Uploaded resume")}
            </h2>
            <p className="muted-text">
              {isLoading
                ? "Matching keywords in real time…"
                : `Matched against JD ${
                    currentScan?.createdAt
                      ? formatDistanceToNow(new Date(currentScan.createdAt), { addSuffix: true })
                      : "just now"
                  }`}
            </p>
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
        </div>

        <div className="results-grid">
          <div className="results-card score-card">
            <ScoreDial value={currentScan?.score ?? 0} isLoading={isLoading} />
          </div>
          <div className="results-card">
            <div className="card-heading-row">
              <h3>Missing skills</h3>
              {!isLoading && missingKeywords.length ? (
                <span className="pill-score secondary">{missingKeywords.length} gaps</span>
              ) : null}
            </div>
            {isLoading ? (
              <p className="muted-text">Detecting role-specific keywords…</p>
            ) : (
              <>
                <TagList
                  items={missingKeywords}
                  emptyLabel="Impressive! Every JD keyword is covered."
                />
                {missingReasons.length ? (
                  <div className="missing-reasons">
                    {missingReasons.map((reason, index) => (
                      <p key={`${reason}-${index}`}>{reason}</p>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
          <div className="results-card">
            <h3>Rewrite suggestions</h3>
            {isLoading ? (
              <p className="muted-text">Drafting tailored bullet points…</p>
            ) : suggestions.length ? (
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
        </div>

        <section className="resume-breakdown">
          {breakdown.map((section) => (
            <article key={section.title} className="breakdown-card">
              <h3>{section.title}</h3>
              {section.data?.length ? (
                <ul>
                  {section.data.map((line, index) => (
                    <li key={`${section.title}-${index}`}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">
                  {isLoading ? "Analyzing…" : "No data extracted."}
                </p>
              )}
            </article>
          ))}
        </section>

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

