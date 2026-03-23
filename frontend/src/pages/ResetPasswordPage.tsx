import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useI18n } from "../contexts/I18nContext";
import { Zap, Sun, Moon } from "lucide-react";
import { resetPassword } from "../api/auth";

export default function ResetPasswordPage() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
    } catch {
      setError(t("auth.invalidResetLink"));
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
          {success ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.passwordReset")}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {t("auth.passwordResetSuccess")}
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full inline-block text-center">
                {t("auth.signIn")}
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.resetPassword")}</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t("auth.resetPasswordDesc")}</p>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
                  {error}
                </div>
              )}

              {!token && (
                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-500/20">
                  {t("auth.missingResetToken")}
                </div>
              )}

              <div>
                <label htmlFor="password" className="label">{t("auth.newPassword")}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="input-field"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">{t("auth.confirmPassword")}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Repeat your password"
                />
              </div>

              <button type="submit" disabled={loading || !token} className="btn-primary w-full">
                {loading ? t("auth.resetting") : t("auth.resetPassword")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
