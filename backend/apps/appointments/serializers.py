from django.utils import timezone
from rest_framework import serializers

from apps.authentication.serializers import UserSerializer
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    supplier_display = serializers.CharField(source="get_supplier_display", read_only=True)
    product_line_display = serializers.CharField(source="get_product_line_display", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "scheduled_at",
            "supplier",
            "supplier_display",
            "product_line",
            "product_line_display",
            "status",
            "status_display",
            "delivered_at",
            "observations",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def validate_scheduled_at(self, value):
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError("La fecha programada no puede ser en el pasado.")
        return value

    def validate(self, attrs):
        instance = self.instance
        new_status = attrs.get("status", getattr(instance, "status", None))
        delivered_at = attrs.get("delivered_at", getattr(instance, "delivered_at", None))

        if new_status == Appointment.Status.DELIVERED and not delivered_at:
            raise serializers.ValidationError(
                {"delivered_at": "El campo delivered_at es requerido cuando el estado es 'Entregada'."}
            )

        if instance and new_status and new_status != instance.status:
            try:
                instance.validate_status_transition(new_status)
            except Exception as exc:
                raise serializers.ValidationError({"status": str(exc)}) from exc

        return attrs

    def create(self, validated_data: dict) -> Appointment:
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class AppointmentListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    supplier_display = serializers.CharField(source="get_supplier_display", read_only=True)
    product_line_display = serializers.CharField(source="get_product_line_display", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "scheduled_at",
            "supplier",
            "supplier_display",
            "product_line",
            "product_line_display",
            "status",
            "status_display",
            "delivered_at",
            "observations",
            "created_by_username",
            "created_at",
        ]
