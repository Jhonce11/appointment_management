"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusBadge from "@/components/appointments/StatusBadge";
import AppointmentFiltersBar from "@/components/appointments/AppointmentFilters";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { appointmentsService } from "@/services/appointments";
import type { Appointment, AppointmentFilters } from "@/types";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState<AppointmentFilters>({ page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | undefined>();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await appointmentsService.list(filters);
      setAppointments(data.results);
      setCount(data.count);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(undefined); setShowForm(true); }
  function openEdit(a: Appointment) { setEditing(a); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(undefined); }
  function afterSave() { closeForm(); load(); }

  async function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta cita?")) return;
    setCancelingId(id);
    try {
      await appointmentsService.cancel(id);
      load();
    } finally {
      setCancelingId(null);
    }
  }

  function canEdit(a: Appointment) {
    return a.status === "scheduled" || a.status === "in_progress";
  }

  function canCancel(a: Appointment) {
    return a.status === "scheduled" || a.status === "in_progress";
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citas de entrega</h1>
            <p className="text-sm text-gray-500 mt-0.5">{count} citas registradas</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva cita
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-4">
          <AppointmentFiltersBar filters={filters} onChange={setFilters} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No se encontraron citas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha programada</th>
                    <th className="px-4 py-3 text-left">Proveedor</th>
                    <th className="px-4 py-3 text-left">Sublínea</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Creado por</th>
                    <th className="px-4 py-3 text-left">Observaciones</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        {new Date(a.scheduled_at).toLocaleString("es-CO", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{a.supplier_display}</td>
                      <td className="px-4 py-3 text-gray-700">{a.product_line_display}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.created_by_username ?? a.created_by?.username}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.observations || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit(a) && (
                            <button
                              onClick={() => openEdit(a)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canCancel(a) && (
                            <button
                              onClick={() => handleCancel(a.id)}
                              disabled={cancelingId === a.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Cancelar"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Página {filters.page ?? 1} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                  disabled={(filters.page ?? 1) <= 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                  disabled={(filters.page ?? 1) >= totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          appointment={editing}
          onSuccess={afterSave}
          onClose={closeForm}
        />
      )}
    </ProtectedRoute>
  );
}
