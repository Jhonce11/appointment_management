import { apiClient } from "@/lib/axios";
import type { DeliveryReportResponse } from "@/types";

export const reportsService = {
  deliveryTimes(dateFrom: string, dateTo: string): Promise<{ data: DeliveryReportResponse }> {
    return apiClient.get("/reports/delivery-times/", {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  },
};
