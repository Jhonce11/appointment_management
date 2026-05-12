from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "supplier", "product_line", "status", "scheduled_at", "created_by")
    list_filter = ("status", "supplier", "product_line")
    search_fields = ("id", "observations")
    readonly_fields = ("id", "created_at", "updated_at")
    date_hierarchy = "scheduled_at"
