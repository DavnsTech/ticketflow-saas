import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getInitials } from "../utils";
import { LayoutDashboard, Ticket, Users, LogOut, Sun, Moon, Zap, LifeBuoy } from "lucide-react";

function NavLink({ to, label, icon: Icon, active }: { to: string; label: string; icon: typeof LayoutDashboard; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200"
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
      {label}
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const initials = user?.displayName ? getInitials(user.displayName) : "";
  const isClient = user?.role === "USER";

  const navItems = isClient
    ? [
        { to: "/portal", label: "Support", icon: LifeBuoy },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/tickets", label: "Tickets", icon: Ticket },
        { to: "/team", label: "Team", icon: Users },
      ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950">
      <aside className="w-60 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="w-7 h-7 rounded-md bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">TicketFlow</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} label={label} icon={icon} active={location.pathname.startsWith(to)} />
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-zinc-800 space-y-2">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-400 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 dark:text-zinc-100 truncate">{user?.displayName}</p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
