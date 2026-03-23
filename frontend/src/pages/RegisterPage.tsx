import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useI18n } from "../contexts/I18nContext";
import { Zap, Sun, Moon, ArrowLeft } from "lucide-react";
import { register, validateInvite, getAuthConfig } from "../api/auth";
import HoneypotField from "../components/HoneypotField";
import PuzzleCaptcha from "../components/PuzzleCaptcha";

export default function RegisterPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAngle, setCaptchaAngle] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [inviteRole, setInviteRole] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      validateInvite(inviteToken)
        .then((res) => {
          setEmail(res.data.email);
          setInviteRole(res.data.role);
          setAllowed(true);
        })
        .catch(() => {
          setError(t("auth.invalidInvitationDesc"));
          setAllowed(false);
        });
    } else {
      getAuthConfig()
        .then((res) => setAllowed(res.data.publicRegistration))
        .catch(() => setAllowed(false));
    }
  }, [inviteToken]);

  const handleCaptchaSolved = useCallback((token: string, angle: number) => {
    setCaptchaToken(token);
    setCaptchaAngle(angle);
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        displayName,
        website,
        captchaToken,
        captchaAngle,
        inviteToken: inviteToken || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message || t("auth.registrationFailed"));
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
          {allowed === null && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {allowed === false && !inviteToken && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.registrationDisabled")}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{t("auth.registrationDisabledDesc")}</p>
              <Link to="/login" className="btn-primary w-full inline-block text-center">{t("auth.backToSignIn")}</Link>
            </>
          )}

          {allowed === false && inviteToken && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.invalidInvitation")}</h2>
              <p className="text-sm text-red-600 dark:text-red-400">{error || t("auth.invalidInvitationDesc")}</p>
              <Link to="/login" className="btn-primary w-full inline-block text-center">{t("auth.backToSignIn")}</Link>
            </>
          )}

          {success && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t("auth.accountCreated")}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {inviteToken ? t("auth.accountCreatedInvite") : t("auth.accountCreatedPublic")}
              </p>
              <Link to="/login" className="btn-primary w-full inline-block text-center">{t("auth.signIn")}</Link>
            </>
          )}

          {allowed && !success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                  {inviteToken ? t("auth.acceptInvitation") : t("auth.createAccount")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {inviteToken
                    ? t("auth.invitedAs", { role: inviteRole })
                    : t("auth.fillDetails")}
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
                  {error}
                </div>
              )}

              <HoneypotField value={website} onChange={setWebsite} />

              <div>
                <label htmlFor="displayName" className="label">{t("auth.name")}</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoFocus
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="label">{t("auth.email")}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!inviteToken}
                  className={`input-field ${inviteToken ? "bg-gray-50 dark:bg-zinc-800 cursor-not-allowed" : ""}`}
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">{t("auth.password")}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

              <PuzzleCaptcha onSolved={handleCaptchaSolved} />

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
              </button>

              <Link to="/login" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300">
                <ArrowLeft size={12} /> {t("auth.alreadyHaveAccount")}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
