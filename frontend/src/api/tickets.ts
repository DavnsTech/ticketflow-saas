import client from "./client";

export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  categoryId: number | null;
  categoryColor: string | null;
  requesterName: string;
  requesterId: number;
  assigneeName: string | null;
  assigneeId: number | null;
  tags: string[];
  customFields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface TicketListResponse {
  tickets: TicketResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface CommentResponse {
  id: number;
  content: string;
  internal: boolean;
  authorName: string;
  authorId: number;
  createdAt: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigneeId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export function listTickets(filters: TicketFilters = {}) {
  return client.get<TicketListResponse>("/tickets", { params: filters });
}

export function getTicket(ticketId: number) {
  return client.get<TicketResponse>(`/tickets/${ticketId}`);
}

export function createTicket(data: {
  title: string;
  description?: string;
  priority?: string;
  categoryId: number;
  tags?: string[];
  customFieldValues?: Record<number, string>;
}) {
  return client.post<TicketResponse>("/tickets", data);
}

export function updateTicket(ticketId: number, data: Record<string, unknown>) {
  return client.put<TicketResponse>(`/tickets/${ticketId}`, data);
}

export function deleteTicket(ticketId: number) {
  return client.delete(`/tickets/${ticketId}`);
}

export function getComments(ticketId: number) {
  return client.get<CommentResponse[]>(`/tickets/${ticketId}/comments`);
}

export function addComment(ticketId: number, data: { content: string; internal: boolean }) {
  return client.post<CommentResponse>(`/tickets/${ticketId}/comments`, data);
}
