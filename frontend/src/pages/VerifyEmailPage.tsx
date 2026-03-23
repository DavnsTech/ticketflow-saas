import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Zap, Sun, Moon } from "lucide-react";
import { verifyEmail } from "../api/auth";

export default function VerifyEmailPage() {
  const { theme, toggle } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

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

        <div className="card p-7 space-y-5 text-center">
          {status === "loading" && (
            <>
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 dark:text-zinc-400">Verifying your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Email verified</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">Your email has been verified. You can now sign in.</p>
              <Link to="/login" className="btn-primary w-full inline-block text-center">
                Sign in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Verification failed</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">Invalid or expired verification link.</p>
              <Link to="/login" className="btn-primary w-full inline-block text-center">
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
