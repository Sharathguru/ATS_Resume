/* eslint-disable react/prop-types */
const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
};

const ScoreDial = ({ value = 0, isLoading = false }) => {
  const score = clampScore(value);
  const rotation = `${score * 3.6}deg`;

  return (
    <div className="score-dial">
      <div
        className={`score-ring ${isLoading ? "loading" : ""}`}
        style={{
          background: isLoading
            ? "var(--surface-3)"
            : `conic-gradient(var(--accent) ${rotation}, var(--surface-3) 0deg)`,
        }}
      >
        <div className={`score-core ${isLoading ? "loading" : ""}`}>
          {isLoading ? (
            <>
              <span className="inline-spinner" />
              <span>Calculating…</span>
            </>
          ) : (
            <>
              <p className="score-value">{score}</p>
              <span>ATS score</span>
            </>
          )}
        </div>
      </div>
      <p>
        {isLoading
          ? "Crunching resume vs JD keywords…"
          : `Higher than ${Math.round(score / 10) * 10}% of recent scans.`}
      </p>
    </div>
  );
};

export default ScoreDial;

