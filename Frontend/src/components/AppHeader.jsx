import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { logout, selectAuthUser } from "../features/auth/authSlice";
import { selectHistory } from "../features/scan/scanSlice";

const AppHeader = () => {
  const dispatch = useDispatch();
  const history = useSelector(selectHistory);
  const user = useSelector(selectAuthUser);
  const lastRun = history?.[0]?.createdAt;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">ATS Resume Review Studio</p>
        <h1>
          Transform resumes into job-winning, ATS-ready profiles in a single scan.
        </h1>
        <p className="subtitle">
          Upload a resume, paste the job description, and let the AI highlight gaps,
          rewrite content, and boost your ATS score.
        </p>
      </div>
      <div className="header-stats">
        <div>
          <span className="stat-label">Signed in as</span>
          <p className="stat-value small">{user?.username || user?.email}</p>
        </div>
        <div>
          <span className="stat-label">Scans stored</span>
          <p className="stat-value">{history.length}</p>
        </div>
        <div>
          <span className="stat-label">Last scan</span>
          <p className="stat-value">
            {lastRun ? format(new Date(lastRun), "MMM dd, HH:mm") : "—"}
          </p>
        </div>
        <button type="button" className="ghost-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;

