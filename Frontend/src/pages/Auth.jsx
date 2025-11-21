import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dismissAuthError,
  loginUser,
  registerUser,
  selectAuthError,
  selectAuthStatus,
} from "../features/auth/authSlice";

const AuthPage = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isLoading = status === "loading";
  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    dispatch(dismissAuthError());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(dismissAuthError());
    if (mode === "login") {
      dispatch(loginUser({ email: form.email, password: form.password }));
    } else {
      dispatch(
        registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        })
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>{mode === "login" ? "Sign in to continue" : "Create your free account"}</h1>
        <p className="subtitle">
          Securely store your ATS scans, resume rewrites, and keyword insights behind your personal
          workspace.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              <span>Full name</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={isLoading}
              />
            </label>
          )}
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
          </label>
          {mode === "register" && (
            <label>
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </label>
          )}

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button type="button" className="link-button" onClick={toggleMode} disabled={isLoading}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

