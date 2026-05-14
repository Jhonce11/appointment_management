"use client";

import type { AppointmentFilters, AppointmentStatus, ProductLine, Supplier } from "@/types";

interface Props {
  filters: AppointmentFilters;
  onChange: (f: AppointmentFilters) => void;
}

export default function AppointmentFiltersBar({ filters, onChange }: Props) {
  function set(key: keyof AppointmentFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.supplier ?? ""}
        onChange={(e) => set("supplier", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los proveedores</option>
        <option value="A">Proveedor A</option>
        <option value="B">Proveedor B</option>
        <option value="C">Proveedor C</option>
      </select>

      <select
        value={filters.product_line ?? ""}
        onChange={(e) => set("product_line", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las sublíneas</option>
        <option value="shirts">Camisetas</option>
        <option value="pants">Pantalones</option>
        <option value="shoes">Zapatos</option>
        <option value="accessories">Accesorios</option>
      </select>

      <select
        value={filters.status ?? ""}
        onChange={(e) => set("status", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los estados</option>
        <option value="scheduled">Programada</option>
        <option value="in_progress">En proceso</option>
        <option value="delivered">Entregada</option>
        <option value="cancelled">Cancelada</option>
      </select>

      <input
        type="date"
        value={filters.date_from ?? ""}
        onChange={(e) => set("date_from", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Desde"
      />

      <input
        type="date"
        value={filters.date_to ?? ""}
        onChange={(e) => set("date_to", e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Hasta"
      />

      <button
        onClick={() => onChange({ page: 1 })}
        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        Limpiar
      </button>
    </div>
  );
}
