from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .reports import get_delivery_time_report


PRODUCT_LINE_LABELS = {
    "shirts": "Camisetas",
    "pants": "Pantalones",
    "shoes": "Zapatos",
    "accessories": "Accesorios",
}


class DeliveryTimeReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if not date_from or not date_to:
            return Response(
                {"detail": "Los parámetros 'date_from' y 'date_to' son requeridos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rows = get_delivery_time_report(date_from, date_to)

        results = [
            {
                "product_line": row["product_line"],
                "product_line_display": PRODUCT_LINE_LABELS.get(row["product_line"], row["product_line"]),
                "total_deliveries": row["total_deliveries"],
                "avg_hours": round(float(row["avg_hours"]), 2) if row["avg_hours"] else 0,
                "avg_minutes": round(float(row["avg_minutes"]), 2) if row["avg_minutes"] else 0,
            }
            for row in rows
        ]

        return Response({"date_from": date_from, "date_to": date_to, "results": results})
