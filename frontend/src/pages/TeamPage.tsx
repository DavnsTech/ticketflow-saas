import { useEffect, useState, useCallback } from "react";
import { listUsers, changeRole } from "../api/users";
import type { UserResponse } from "../api/users";
import { createInvitation, listInvitations, deleteInvitation } from "../api/invitations";
import type { InvitationResponse } from "../api/invitations";
import { useAuth } from "../contexts/AuthContext";
import { RoleBadge } from "../components/StatusBadge";
import { getInitials } from "../utils";
import { Shield, UserPlus, Copy, Trash2, Mail, Check, X } from "lucide-react";

export default function TeamPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

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

  const loadInvitations = useCallback(async () => {
    try {
      const response = await listInvitations();
      setInvitations(response.data);
    } catch { /* admin-only, ignore if not admin */ }
  }, []);

  useEffect(() => {
    loadUsers();
    loadInvitations();
  }, [loadUsers, loadInvitations]);

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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Invitations</h3>
            <button
              onClick={() => setShowInviteForm(true)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <UserPlus size={14} /> Invite member
            </button>
          </div>

          {showInviteForm && (
            <InviteForm
              onClose={() => setShowInviteForm(false)}
              onCreated={() => { setShowInviteForm(false); loadInvitations(); }}
            />
          )}

          {invitations.length > 0 && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Expires</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <InvitationRow key={inv.id} invitation={inv} onDeleted={loadInvitations} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {invitations.length === 0 && !showInviteForm && (
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">No pending invitations</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Invite team members to give them access</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InviteForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createInvitation({ email, role });
      onCreated();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message || "Failed to create invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">New invitation</h4>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="inviteEmail" className="label">Email</label>
            <input
              id="inviteEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="input-field"
              placeholder="colleague@company.com"
            />
          </div>
          <div>
            <label htmlFor="inviteRole" className="label">Role</label>
            <select
              id="inviteRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="USER">User</option>
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary text-xs">
            {loading ? "Sending..." : "Send invitation"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InvitationRow({ invitation, onDeleted }: { invitation: InvitationResponse; onDeleted: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const fullLink = window.location.origin + invitation.inviteLink;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    await deleteInvitation(invitation.id);
    onDeleted();
  }

  return (
    <tr className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-4 py-3 text-gray-900 dark:text-zinc-100">{invitation.email}</td>
      <td className="px-4 py-3"><RoleBadge value={invitation.role} /></td>
      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 text-xs tabular-nums">
        {new Date(invitation.expiresAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={copyLink}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Copy invite link"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Revoke invitation"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
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
