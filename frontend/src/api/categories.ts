import client from "./client";

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  active: boolean;
  displayOrder: number;
  agentIds: number[];
}

export interface CustomFieldResponse {
  id: number;
  categoryId: number;
  name: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string | null;
  placeholder: string | null;
  displayOrder: number;
  active: boolean;
}

export function listCategories() {
  return client.get<CategoryResponse[]>("/categories");
}

export function getCategoryFields(categoryId: number) {
  return client.get<CustomFieldResponse[]>(`/categories/${categoryId}/fields`);
}

// Admin
export function listAllCategories() {
  return client.get<CategoryResponse[]>("/admin/categories");
}

export function createCategory(payload: { name: string; description?: string; color?: string; icon?: string }) {
  return client.post<CategoryResponse>("/admin/categories", payload);
}

export function updateCategory(id: number, payload: { name: string; description?: string; color?: string; icon?: string }) {
  return client.put<CategoryResponse>(`/admin/categories/${id}`, payload);
}

export function toggleCategory(id: number) {
  return client.put(`/admin/categories/${id}/toggle`);
}

export function setCategoryAgents(id: number, agentIds: number[]) {
  return client.put(`/admin/categories/${id}/agents`, { agentIds });
}

export function listAllCategoryFields(categoryId: number) {
  return client.get<CustomFieldResponse[]>(`/admin/categories/${categoryId}/fields`);
}

export function createCustomField(categoryId: number, payload: { name: string; label: string; fieldType?: string; required?: boolean; options?: string; placeholder?: string }) {
  return client.post<CustomFieldResponse>(`/admin/categories/${categoryId}/fields`, payload);
}

export function updateCustomField(fieldId: number, payload: { name: string; label: string; fieldType?: string; required?: boolean; options?: string; placeholder?: string }) {
  return client.put<CustomFieldResponse>(`/admin/custom-fields/${fieldId}`, payload);
}

export function toggleCustomField(fieldId: number) {
  return client.put(`/admin/custom-fields/${fieldId}/toggle`);
}

export function deleteCustomField(fieldId: number) {
  return client.delete(`/admin/custom-fields/${fieldId}`);
}
