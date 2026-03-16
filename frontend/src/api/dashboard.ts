import client from "./client";

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  averageResolutionTimeHours: number | null;
}

export interface PriorityCount {
  priority: string;
  count: number;
}

export interface AgentStats {
  agentId: number;
  agentName: string;
  totalAssigned: number;
  resolved: number;
}

export function getStats() {
  return client.get<DashboardStats>("/dashboard/stats");
}

export function getByPriority() {
  return client.get<PriorityCount[]>("/dashboard/by-priority");
}

export function getByAgent() {
  return client.get<AgentStats[]>("/dashboard/by-agent");
}
