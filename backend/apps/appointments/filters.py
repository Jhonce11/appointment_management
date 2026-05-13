import django_filters
from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    date_from = django_filters.DateTimeFilter(field_name="scheduled_at", lookup_expr="gte")
    date_to = django_filters.DateTimeFilter(field_name="scheduled_at", lookup_expr="lte")

    class Meta:
        model = Appointment
        fields = ["supplier", "product_line", "status", "date_from", "date_to"]
