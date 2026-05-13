import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from apps.appointments.models import Appointment


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def test_user(db) -> User:
    return User.objects.create_user(
        username="testuser",
        password="TestPass123!",
        email="test@example.com",
    )


@pytest.fixture
def auth_client(api_client: APIClient, test_user: User) -> APIClient:
    response = api_client.post(
        "/api/auth/login/",
        {"username": "testuser", "password": "TestPass123!"},
        format="json",
    )
    token = response.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client


@pytest.fixture
def future_appointment(db, test_user: User) -> Appointment:
    return Appointment.objects.create(
        scheduled_at=timezone.now() + timedelta(days=5),
        supplier=Appointment.Supplier.A,
        product_line=Appointment.ProductLine.SHIRTS,
        status=Appointment.Status.SCHEDULED,
        created_by=test_user,
    )
