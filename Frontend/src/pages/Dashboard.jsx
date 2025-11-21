import AppHeader from "../components/AppHeader";
import HistoryPanel from "../components/HistoryPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import ResultsPanel from "../components/ResultsPanel";
import UploadForm from "../components/UploadForm";

const Dashboard = () => {
  return (
    <div className="app-shell">
      <div className="hero-gradient" aria-hidden="true" />
      <AppHeader />
      <main className="dashboard-grid">
        <section className="panel panel-accent">
          <UploadForm />
        </section>
        <section className="panel panel-main">
          <ResultsPanel />
        </section>
        <section className="panel panel-muted">
          <HistoryPanel />
        </section>
      </main>
      <LoadingOverlay />
    </div>
  );
};

export default Dashboard;

