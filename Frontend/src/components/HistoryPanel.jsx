import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  clearHistory,
  selectCurrentScan,
  selectHistory,
  selectStatus,
  showHistoryScan,
} from "../features/scan/scanSlice";

const HistoryPanel = () => {
  const dispatch = useDispatch();
  const history = useSelector(selectHistory);
  const currentScan = useSelector(selectCurrentScan);
  const status = useSelector(selectStatus);

  const handleSelect = (scanId) => {
    if (status === "loading") return;
    dispatch(showHistoryScan(scanId));
  };

  const handleClear = () => {
    if (!history.length || status === "loading") return;
    dispatch(clearHistory());
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <div>
          <p className="eyebrow">Scan history</p>
          <h2>Past resume reviews</h2>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={handleClear}
          disabled={!history.length || status === "loading"}
        >
          Clear
        </button>
      </div>

      {history.length === 0 ? (
        <p className="muted-text">
          Every scan you run will be stored here locally so you can revisit ATS scores and download
          earlier rewrites.
        </p>
      ) : (
        <ul className="history-list">
          {history.map((item) => (
            <li
              key={item.scanId}
              className={`history-card ${currentScan?.scanId === item.scanId ? "active" : ""}`}
              onClick={() => handleSelect(item.scanId)}
            >
              <div>
                <p className="history-date">
                  {item.createdAt ? format(new Date(item.createdAt), "MMM dd • HH:mm") : "Unknown"}
                </p>
                <p className="history-title">{item.originalFileName || "Resume"}</p>
              </div>
              <div className="history-meta">
                <span>Score {item.score ?? 0}</span>
                <span>{item.missingKeywords?.length || 0} keywords missing</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPanel;

