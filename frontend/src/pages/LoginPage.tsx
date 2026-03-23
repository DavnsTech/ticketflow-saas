import { useState, useCallback, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useI18n } from "../contexts/I18nContext";
import { Zap, Sun, Moon } from "lucide-react";
import { getAuthConfig } from "../api/auth";
import HoneypotField from "../components/HoneypotField";
import PuzzleCaptcha from "../components/PuzzleCaptcha";

export default function LoginPage() {
  const { user, login } = useAuth();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAngle, setCaptchaAngle] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [publicRegistration, setPublicRegistration] = useState(false);

  useEffect(() => {
    getAuthConfig().then((res) => setPublicRegistration(res.data.publicRegistration)).catch(() => {});
  }, []);

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
      setError(t("auth.invalidCredentials"));
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.signIn")}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t("auth.signInDesc")}</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <HoneypotField value={website} onChange={setWebsite} />

          <div>
            <label htmlFor="email" className="label">{t("auth.email")}</label>
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
            <label htmlFor="password" className="label">{t("auth.password")}</label>
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
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              {t("auth.forgotPassword")}
            </Link>
            <span className="text-gray-400 dark:text-zinc-500">
              {t("auth.demo")}
            </span>
          </div>

          {publicRegistration && (
            <p className="text-xs text-center text-gray-500 dark:text-zinc-400">
              {t("auth.dontHaveAccount")}{" "}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                {t("auth.createOne")}
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
