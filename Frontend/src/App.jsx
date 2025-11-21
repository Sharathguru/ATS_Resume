import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./features/auth/authSlice";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/Auth";
import "./App.css";

function App() {
  const isAuthed = useSelector(selectIsAuthenticated);
  return isAuthed ? <Dashboard /> : <AuthPage />;
}

export default App;
