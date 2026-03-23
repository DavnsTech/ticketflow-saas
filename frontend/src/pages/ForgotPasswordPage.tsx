import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useI18n } from "../contexts/I18nContext";
import { Zap, Sun, Moon, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../api/auth";
import HoneypotField from "../components/HoneypotField";
import PuzzleCaptcha from "../components/PuzzleCaptcha";

export default function ForgotPasswordPage() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAngle, setCaptchaAngle] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCaptchaSolved = useCallback((token: string, angle: number) => {
    setCaptchaToken(token);
    setCaptchaAngle(angle);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword({ email, website, captchaToken, captchaAngle });
      setSent(true);
    } catch {
      setError(t("auth.somethingWrong"));
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

        <div className="card p-7 space-y-5">
          {sent ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.checkEmail")}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {t("auth.checkEmailDesc", { email })}
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full inline-block text-center">
                {t("auth.backToSignIn")}
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.forgotPasswordTitle")}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {t("auth.forgotPasswordDesc")}
                </p>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="input-field"
                  placeholder="you@company.com"
                />
              </div>

              <PuzzleCaptcha onSolved={handleCaptchaSolved} />

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t("auth.sending") : t("auth.sendResetLink")}
              </button>

              <Link to="/login" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300">
                <ArrowLeft size={12} /> {t("auth.backToSignIn")}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
