export type Supplier = "A" | "B" | "C";

export type ProductLine = "shirts" | "pants" | "shoes" | "accessories";

export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "delivered"
  | "cancelled";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Appointment {
  id: string;
  scheduled_at: string;
  supplier: Supplier;
  supplier_display: string;
  product_line: ProductLine;
  product_line_display: string;
  status: AppointmentStatus;
  status_display: string;
  delivered_at: string | null;
  observations: string;
  created_by: User;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentFilters {
  supplier?: Supplier;
  product_line?: ProductLine;
  status?: AppointmentStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface DeliveryReportRow {
  product_line: ProductLine;
  product_line_display: string;
  total_deliveries: number;
  avg_hours: number;
  avg_minutes: number;
}

export interface DeliveryReportResponse {
  date_from: string;
  date_to: string;
  results: DeliveryReportRow[];
}

export const SUPPLIER_LABELS: Record<Supplier, string> = {
  A: "Proveedor A",
  B: "Proveedor B",
  C: "Proveedor C",
};

export const PRODUCT_LINE_LABELS: Record<ProductLine, string> = {
  shirts: "Camisetas",
  pants: "Pantalones",
  shoes: "Zapatos",
  accessories: "Accesorios",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Programada",
  in_progress: "En proceso",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
