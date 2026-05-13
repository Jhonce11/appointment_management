from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet
from .report_views import DeliveryTimeReportView

router = DefaultRouter()
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = router.urls + [
    path("reports/delivery-times/", DeliveryTimeReportView.as_view(), name="report-delivery-times"),
]
