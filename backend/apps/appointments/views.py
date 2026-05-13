from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .filters import AppointmentFilter
from .models import Appointment
from .serializers import AppointmentListSerializer, AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filterset_class = AppointmentFilter
    ordering_fields = ["scheduled_at", "created_at", "status"]
    ordering = ["-scheduled_at"]

    def get_queryset(self):
        return Appointment.objects.select_related("created_by").all()

    def get_serializer_class(self):
        if self.action == "list":
            return AppointmentListSerializer
        return AppointmentSerializer

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            {"detail": "La eliminación no está permitida. Use la acción 'cancel' para cancelar una cita."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request: Request, pk=None) -> Response:
        appointment = self.get_object()
        try:
            appointment.validate_status_transition(Appointment.Status.CANCELLED)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status", "updated_at"])
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_200_OK)
