"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { appointmentsService } from "@/services/appointments";
import { STATUS_LABELS } from "@/types";
import type { Appointment, AppointmentStatus } from "@/types";

interface Props {
  appointment?: Appointment;
  onSuccess: () => void;
  onClose: () => void;
}

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled:   ["in_progress", "cancelled"],
  in_progress: ["delivered", "cancelled"],
  delivered:   [],
  cancelled:   [],
};

export default function AppointmentForm({ appointment, onSuccess, onClose }: Props) {
  const isEdit = !!appointment;
  const [form, setForm] = useState({
    scheduled_at: appointment?.scheduled_at?.slice(0, 16) ?? "",
    supplier: appointment?.supplier ?? "",
    product_line: appointment?.product_line ?? "",
    observations: appointment?.observations ?? "",
    status: appointment?.status ?? "",
    delivered_at: appointment?.delivered_at?.slice(0, 16) ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextStatuses = appointment
    ? ALLOWED_TRANSITIONS[appointment.status]
    : [];
  const statusChanged = isEdit && form.status !== appointment?.status;
  const needsDeliveredAt = form.status === "delivered";

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isEdit) {
        const payload: Record<string, string> = {
          scheduled_at: form.scheduled_at,
          supplier: form.supplier,
          product_line: form.product_line,
          observations: form.observations,
        };
        if (statusChanged) payload.status = form.status;
        if (statusChanged && needsDeliveredAt) payload.delivered_at = form.delivered_at;
        await appointmentsService.update(appointment.id, payload);
      } else {
        await appointmentsService.create(form);
      }
      onSuccess();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: Record<string, string[]> } };
      const messages = apiError?.response?.data;
      if (messages) {
        setError(Object.values(messages).flat().join(" "));
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar cita" : "Nueva cita"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora programada
            </label>
            <input
              type="datetime-local"
              required
              value={form.scheduled_at}
              onChange={(e) => set("scheduled_at", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select
              required
              value={form.supplier}
              onChange={(e) => set("supplier", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="A">Proveedor A</option>
              <option value="B">Proveedor B</option>
              <option value="C">Proveedor C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sublínea de producto</label>
            <select
              required
              value={form.product_line}
              onChange={(e) => set("product_line", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="shirts">Camisetas</option>
              <option value="pants">Pantalones</option>
              <option value="shoes">Zapatos</option>
              <option value="accessories">Accesorios</option>
            </select>
          </div>

          {isEdit && nextStatuses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cambiar estado
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={appointment!.status}>
                  {STATUS_LABELS[appointment!.status]} (actual)
                </option>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isEdit && needsDeliveredAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora de entrega real <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required={needsDeliveredAt}
                value={form.delivered_at}
                onChange={(e) => set("delivered_at", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={form.observations}
              onChange={(e) => set("observations", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Opcional..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
            >
              {isLoading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
