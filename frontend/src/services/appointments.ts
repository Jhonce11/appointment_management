import { apiClient } from "@/lib/axios";
import type {
  Appointment,
  AppointmentFilters,
  PaginatedResponse,
} from "@/types";

export const appointmentsService = {
  list(filters: AppointmentFilters = {}): Promise<{ data: PaginatedResponse<Appointment> }> {
    return apiClient.get("/appointments/", { params: filters });
  },

  get(id: string): Promise<{ data: Appointment }> {
    return apiClient.get(`/appointments/${id}/`);
  },

  create(payload: Partial<Appointment>): Promise<{ data: Appointment }> {
    return apiClient.post("/appointments/", payload);
  },

  update(id: string, payload: Partial<Appointment>): Promise<{ data: Appointment }> {
    return apiClient.patch(`/appointments/${id}/`, payload);
  },

  cancel(id: string): Promise<{ data: Appointment }> {
    return apiClient.post(`/appointments/${id}/cancel/`);
  },
};
