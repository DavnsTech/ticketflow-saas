import client from "./client";

export interface UserResponse {
  id: number;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export function listUsers() {
  return client.get<UserResponse[]>("/users");
}

export function changeRole(userId: number, role: string) {
  return client.put<UserResponse>(`/users/${userId}/role`, { role });
}
