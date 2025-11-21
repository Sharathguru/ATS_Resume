import { useSelector } from "react-redux";
import { selectStatus } from "../features/scan/scanSlice";

const LoadingOverlay = () => {
  const status = useSelector(selectStatus);
  if (status !== "loading") return null;

  return (
    <div className="loading-overlay" role="status" aria-live="assertive">
      <div className="spinner" />
    </div>
  );
};

export default LoadingOverlay;

