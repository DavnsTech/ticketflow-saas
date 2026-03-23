import client from "./client";

export interface InvitationResponse {
  id: number;
  email: string;
  role: string;
  token: string;
  inviteLink: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export function createInvitation(payload: { email: string; role?: string }) {
  return client.post<InvitationResponse>("/invitations", payload);
}

export function listInvitations() {
  return client.get<InvitationResponse[]>("/invitations");
}

export function deleteInvitation(id: number) {
  return client.delete(`/invitations/${id}`);
}
