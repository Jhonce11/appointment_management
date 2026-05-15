"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusBadge from "@/components/appointments/StatusBadge";
import { appointmentsService } from "@/services/appointments";
import { useAuth } from "@/context/AuthContext";
import type { Appointment } from "@/types";

interface StatusCount {
  scheduled: number;
  in_progress: number;
  delivered: number;
  cancelled: number;
}

const STAT_CARDS = [
  { key: "scheduled", label: "Programadas", icon: CalendarDays, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "in_progress", label: "En proceso", icon: Clock, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { key: "delivered", label: "Entregadas", icon: CheckCircle2, color: "bg-green-50 text-green-600 border-green-100" },
  { key: "cancelled", label: "Canceladas", icon: XCircle, color: "bg-red-50 text-red-600 border-red-100" },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<StatusCount>({ scheduled: 0, in_progress: 0, delivered: 0, cancelled: 0 });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [s, ip, d, c, up] = await Promise.all([
          appointmentsService.list({ status: "scheduled", page: 1 }),
          appointmentsService.list({ status: "in_progress", page: 1 }),
          appointmentsService.list({ status: "delivered", page: 1 }),
          appointmentsService.list({ status: "cancelled", page: 1 }),
          appointmentsService.list({ date_from: today, date_to: today, ordering: "scheduled_at", page: 1 }),
        ]);
        setCounts({
          scheduled: s.data.count,
          in_progress: ip.data.count,
          delivered: d.data.count,
          cancelled: c.data.count,
        });
        setUpcoming(up.data.results.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.first_name || user?.username} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Resumen del sistema de citas de entrega</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className={`rounded-xl border p-5 flex items-center gap-4 ${color}`}>
                  <div className="shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{counts[key]}</p>
                    <p className="text-sm opacity-80">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Citas del día</h2>
                <Link
                  href="/appointments"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  Ver todas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No hay citas registradas para hoy.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left">Fecha</th>
                      <th className="px-5 py-3 text-left">Proveedor</th>
                      <th className="px-5 py-3 text-left">Sublínea</th>
                      <th className="px-5 py-3 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {upcoming.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                          {new Date(a.scheduled_at).toLocaleString("es-CO", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-5 py-3 text-gray-700">{a.supplier_display}</td>
                        <td className="px-5 py-3 text-gray-700">{a.product_line_display}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
