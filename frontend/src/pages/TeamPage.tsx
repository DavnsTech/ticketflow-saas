import { useEffect, useState, useCallback } from "react";
import { listUsers, changeRole } from "../api/users";
import type { UserResponse } from "../api/users";
import { useAuth } from "../contexts/AuthContext";
import { RoleBadge } from "../components/StatusBadge";
import { getInitials } from "../utils";
import { Shield, UserPlus } from "lucide-react";

export default function TeamPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const response = await listUsers();
      setUsers(response.data);
    } catch {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(userId: number, role: string) {
    await changeRole(userId, role);
    loadUsers();
  }

  const isAdmin = user?.role === "ADMIN";
  const teamByRole = {
    admins: users.filter((u) => u.role === "ADMIN"),
    agents: users.filter((u) => u.role === "AGENT"),
    users: users.filter((u) => u.role === "USER"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Team</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{users.length} members</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
          <span className="flex items-center gap-1"><Shield size={12} /> {teamByRole.admins.length} admins</span>
          <span>{teamByRole.agents.length} agents</span>
          <span>{teamByRole.users.length} users</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatBlock label="Admins" count={teamByRole.admins.length} accent="text-purple-600 dark:text-purple-400" />
        <StatBlock label="Agents" count={teamByRole.agents.length} accent="text-teal-600 dark:text-teal-400" />
        <StatBlock label="Users" count={teamByRole.users.length} accent="text-gray-600 dark:text-zinc-400" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                isSelf={member.email === user?.email}
                onRoleChange={handleRoleChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserPlus size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Add team members</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Use the /api/auth/register endpoint to create new accounts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{count}</p>
    </div>
  );
}

function MemberRow({ member, isAdmin, isSelf, onRoleChange }: { member: UserResponse; isAdmin: boolean; isSelf: boolean; onRoleChange: (id: number, role: string) => void }) {
  const initials = getInitials(member.displayName);

  return (
    <tr className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-400 shrink-0">
            {initials}
          </div>
          <span className="font-medium text-gray-900 dark:text-zinc-100">{member.displayName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{member.email}</td>
      <td className="px-4 py-3"><RoleBadge value={member.role} /></td>
      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 tabular-nums text-xs">
        {new Date(member.createdAt).toLocaleDateString()}
      </td>
      {isAdmin && (
        <td className="px-4 py-3 text-right">
          {!isSelf ? (
            <select
              value={member.role}
              onChange={(e) => onRoleChange(member.id, e.target.value)}
              className="input-field w-auto text-xs py-1"
            >
              <option value="USER">User</option>
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          ) : (
            <span className="text-xs text-gray-400 dark:text-zinc-500">You</span>
          )}
        </td>
      )}
    </tr>
  );
}
