import pytest
from rest_framework import status
from rest_framework.test import APIClient

from django.contrib.auth.models import User


@pytest.mark.django_db
def test_login_with_valid_credentials_returns_tokens(api_client: APIClient, test_user: User):
    response = api_client.post(
        "/api/auth/login/",
        {"username": "testuser", "password": "TestPass123!"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["username"] == "testuser"


@pytest.mark.django_db
def test_login_with_invalid_credentials_returns_400(api_client: APIClient, test_user: User):
    response = api_client.post(
        "/api/auth/login/",
        {"username": "testuser", "password": "wrongpassword"},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_unauthenticated_request_returns_401(api_client: APIClient):
    response = api_client.get("/api/auth/me/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_me_endpoint_returns_current_user(auth_client: APIClient, test_user: User):
    response = auth_client.get("/api/auth/me/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == test_user.username
