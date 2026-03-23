import { useState, useCallback } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Zap, Sun, Moon } from "lucide-react";
import HoneypotField from "../components/HoneypotField";
import PuzzleCaptcha from "../components/PuzzleCaptcha";

export default function LoginPage() {
  const { user, login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAngle, setCaptchaAngle] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCaptchaSolved = useCallback((token: string, angle: number) => {
    setCaptchaToken(token);
    setCaptchaAngle(angle);
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, website, captchaToken, captchaAngle);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 relative">
      <button
        onClick={toggle}
        className="absolute top-6 right-6 p-2 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm px-4">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">TicketFlow</span>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Sign in</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <HoneypotField value={website} onChange={setWebsite} />

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              className="input-field"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="input-field"
              placeholder="Enter your password"
            />
          </div>

          <PuzzleCaptcha onSolved={handleCaptchaSolved} />

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Forgot password?
            </Link>
            <span className="text-gray-400 dark:text-zinc-500">
              Demo: admin@ticketflow.local / password123
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
