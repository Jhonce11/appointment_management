import pytest
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient

from apps.appointments.models import Appointment
from django.contrib.auth.models import User


@pytest.fixture
def delivered_appointment(db, test_user: User) -> Appointment:
    scheduled = timezone.now() - timedelta(days=2)
    delivered = scheduled + timedelta(hours=2)
    return Appointment.objects.create(
        scheduled_at=scheduled,
        delivered_at=delivered,
        supplier=Appointment.Supplier.A,
        product_line=Appointment.ProductLine.SHIRTS,
        status=Appointment.Status.DELIVERED,
        created_by=test_user,
    )


@pytest.mark.django_db
def test_report_returns_expected_fields(auth_client: APIClient, delivered_appointment: Appointment):
    date_from = (timezone.now() - timedelta(days=30)).date().isoformat()
    date_to = (timezone.now() + timedelta(days=1)).date().isoformat()

    response = auth_client.get(
        f"/api/reports/delivery-times/?date_from={date_from}&date_to={date_to}"
    )
    assert response.status_code == status.HTTP_200_OK
    assert "results" in response.data
    assert len(response.data["results"]) >= 1

    result = response.data["results"][0]
    assert "product_line" in result
    assert "total_deliveries" in result
    assert "avg_hours" in result
    assert "avg_minutes" in result


@pytest.mark.django_db
def test_report_without_date_params_returns_400(auth_client: APIClient):
    response = auth_client.get("/api/reports/delivery-times/")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_report_requires_authentication(api_client: APIClient):
    response = api_client.get("/api/reports/delivery-times/?date_from=2026-01-01&date_to=2026-12-31")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
