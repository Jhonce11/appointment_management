import pytest
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient

from apps.appointments.models import Appointment


@pytest.mark.django_db
def test_create_appointment_with_past_date_returns_400(auth_client: APIClient):
    past_date = (timezone.now() - timedelta(days=1)).isoformat()
    response = auth_client.post(
        "/api/appointments/",
        {
            "scheduled_at": past_date,
            "supplier": "A",
            "product_line": "shirts",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "scheduled_at" in response.data


@pytest.mark.django_db
def test_create_appointment_with_future_date_returns_201(auth_client: APIClient):
    future_date = (timezone.now() + timedelta(days=3)).isoformat()
    response = auth_client.post(
        "/api/appointments/",
        {
            "scheduled_at": future_date,
            "supplier": "B",
            "product_line": "pants",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["supplier"] == "B"
    assert response.data["status"] == "scheduled"


@pytest.mark.django_db
def test_delivered_status_requires_delivered_at(
    auth_client: APIClient, future_appointment: Appointment
):
    future_appointment.status = Appointment.Status.IN_PROGRESS
    future_appointment.save()

    response = auth_client.patch(
        f"/api/appointments/{future_appointment.id}/",
        {"status": "delivered"},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "delivered_at" in str(response.data)


@pytest.mark.django_db
def test_invalid_status_transition_returns_400(
    auth_client: APIClient, future_appointment: Appointment
):
    future_appointment.status = Appointment.Status.IN_PROGRESS
    future_appointment.save()
    future_appointment.status = Appointment.Status.DELIVERED
    future_appointment.delivered_at = timezone.now()
    future_appointment.save()

    response = auth_client.patch(
        f"/api/appointments/{future_appointment.id}/",
        {"status": "scheduled"},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_cancel_action_sets_status_to_cancelled(
    auth_client: APIClient, future_appointment: Appointment
):
    response = auth_client.post(f"/api/appointments/{future_appointment.id}/cancel/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "cancelled"


@pytest.mark.django_db
def test_delete_appointment_returns_405(auth_client: APIClient, future_appointment: Appointment):
    response = auth_client.delete(f"/api/appointments/{future_appointment.id}/")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
def test_list_appointments_requires_authentication(api_client: APIClient):
    response = api_client.get("/api/appointments/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
