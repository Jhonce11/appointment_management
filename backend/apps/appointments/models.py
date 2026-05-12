import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError


class Appointment(models.Model):

    class Supplier(models.TextChoices):
        A = "A", "Proveedor A"
        B = "B", "Proveedor B"
        C = "C", "Proveedor C"

    class ProductLine(models.TextChoices):
        SHIRTS = "shirts", "Camisetas"
        PANTS = "pants", "Pantalones"
        SHOES = "shoes", "Zapatos"
        ACCESSORIES = "accessories", "Accesorios"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Programada"
        IN_PROGRESS = "in_progress", "En proceso"
        DELIVERED = "delivered", "Entregada"
        CANCELLED = "cancelled", "Cancelada"

    VALID_TRANSITIONS: dict[str, list[str]] = {
        Status.SCHEDULED: [Status.IN_PROGRESS, Status.CANCELLED],
        Status.IN_PROGRESS: [Status.DELIVERED, Status.CANCELLED],
        Status.DELIVERED: [],
        Status.CANCELLED: [],
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scheduled_at = models.DateTimeField()
    supplier = models.CharField(max_length=1, choices=Supplier.choices)
    product_line = models.CharField(max_length=20, choices=ProductLine.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED
    )
    delivered_at = models.DateTimeField(null=True, blank=True)
    observations = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="appointments"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments_appointment"
        ordering = ["-scheduled_at"]
        indexes = [
            models.Index(fields=["scheduled_at"], name="idx_appointment_scheduled_at"),
            models.Index(fields=["status"], name="idx_appointment_status"),
            models.Index(fields=["supplier"], name="idx_appointment_supplier"),
            models.Index(fields=["product_line"], name="idx_appointment_product_line"),
        ]

    def __str__(self) -> str:
        return f"Appointment {self.id} — {self.supplier} / {self.product_line} [{self.status}]"

    def clean(self) -> None:
        if self.scheduled_at and self.scheduled_at < timezone.now() and self._state.adding:
            raise ValidationError(
                {"scheduled_at": "The scheduled date cannot be in the past."}
            )

        if self.status == self.Status.DELIVERED and not self.delivered_at:
            raise ValidationError(
                {"delivered_at": "delivered_at is required when status is 'Entregada'."}
            )

    def validate_status_transition(self, new_status: str) -> None:
        allowed = self.VALID_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(
                {
                    "status": (
                        f"Cannot transition from '{self.get_status_display()}' "
                        f"to '{dict(self.Status.choices).get(new_status, new_status)}'."
                    )
                }
            )
