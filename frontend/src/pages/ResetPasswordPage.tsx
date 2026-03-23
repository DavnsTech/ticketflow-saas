import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Zap, Sun, Moon } from "lucide-react";
import { resetPassword } from "../api/auth";

export default function ResetPasswordPage() {
  const { theme, toggle } = useTheme();
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
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
    } catch {
      setError("Invalid or expired reset link");
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Password reset</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Your password has been updated successfully.
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full inline-block text-center">
                Sign in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Reset password</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Enter your new password</p>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
                  {error}
                </div>
              )}

              {!token && (
                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-500/20">
                  Missing reset token. Please use the link from your email.
                </div>
              )}

              <div>
                <label htmlFor="password" className="label">New password</label>
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
                <label htmlFor="confirmPassword" className="label">Confirm password</label>
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
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
