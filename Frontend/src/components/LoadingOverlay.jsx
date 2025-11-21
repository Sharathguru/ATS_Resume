import { useSelector } from "react-redux";
import { selectStatus } from "../features/scan/scanSlice";

const LoadingOverlay = () => {
  const status = useSelector(selectStatus);
  if (status !== "loading") return null;

  return (
    <div className="loading-overlay" role="status" aria-live="assertive">
      <div className="spinner" />
      <p>Analyzing resume and job description…</p>
    </div>
  );
};

export default LoadingOverlay;

