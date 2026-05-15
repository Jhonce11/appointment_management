"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Search, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { reportsService } from "@/services/reports";
import { PRODUCT_LINE_LABELS } from "@/types";
import type { DeliveryReportRow } from "@/types";

const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const REFRESH_OPTIONS = [
  { value: 0, label: "Manual" },
  { value: 10, label: "10 s" },
  { value: 30, label: "30 s" },
  { value: 60, label: "60 s" },
];

const today = new Date().toISOString().slice(0, 10);
const firstDayOfYear = `${new Date().getFullYear()}-01-01`;

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(firstDayOfYear);
  const [dateTo, setDateTo] = useState(today);
  const [rows, setRows] = useState<DeliveryReportRow[]>([]);
  const [meta, setMeta] = useState<{ date_from: string; date_to: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSearch = useCallback(async () => {
    if (!dateFrom || !dateTo) {
      setError("Ambas fechas son requeridas.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await reportsService.deliveryTimes(dateFrom, dateTo);
      setRows(data.results);
      setMeta({ date_from: data.date_from, date_to: data.date_to });
      setSearched(true);
      setLastUpdated(new Date());
    } catch {
      setError("Error al obtener el reporte. Verifica las fechas e intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  // Initial load on mount
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh: reset timer whenever interval or search function changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(handleSearch, refreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshInterval, handleSearch]);

  const chartData = rows.map((r) => ({
    name: PRODUCT_LINE_LABELS[r.product_line] ?? r.product_line,
    horas: parseFloat(r.avg_hours.toFixed(1)),
    entregas: r.total_deliveries,
  }));

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reporte de tiempos de entrega</h1>
          <p className="text-sm text-gray-500 mt-1">
            Promedio de tiempo de entrega por sublínea de producto
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actualización automática
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REFRESH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isLoading ? "Consultando..." : "Consultar"}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 min-h-[28px]">
            {error ? (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1">{error}</p>
            ) : (
              <span />
            )}
            {lastUpdated && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                Última actualización: {lastUpdated.toLocaleTimeString("es-CO")}
                {refreshInterval > 0 && (
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Auto ({refreshInterval}s)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {searched && (
          <>
            {rows.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                No hay entregas registradas en el período seleccionado.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Promedio de horas de entrega por sublínea
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        label={{ value: "Horas", angle: -90, position: "insideLeft", fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value} h`, "Promedio"]}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">
                      Período: {meta?.date_from} — {meta?.date_to}
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Sublínea</th>
                        <th className="px-4 py-3 text-right">Total entregas</th>
                        <th className="px-4 py-3 text-right">Promedio (horas)</th>
                        <th className="px-4 py-3 text-right">Promedio (minutos)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((r) => (
                        <tr key={r.product_line} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {PRODUCT_LINE_LABELS[r.product_line] ?? r.product_line}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">{r.total_deliveries}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{r.avg_hours.toFixed(1)} h</td>
                          <td className="px-4 py-3 text-right text-gray-700">{r.avg_minutes.toFixed(0)} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
