from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


TEST_USERS = [
    {
        "username": "admin",
        "password": "Admin1234!",
        "email": "admin@appointments.com",
        "first_name": "Admin",
        "last_name": "Sistema",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "username": "operador1",
        "password": "Oper1234!",
        "email": "operador1@appointments.com",
        "first_name": "Carlos",
        "last_name": "López",
    },
    {
        "username": "operador2",
        "password": "Oper1234!",
        "email": "operador2@appointments.com",
        "first_name": "Ana",
        "last_name": "Martínez",
    },
]


class Command(BaseCommand):
    help = "Creates test users for development"

    def handle(self, *args, **kwargs) -> None:
        for data in TEST_USERS:
            username = data["username"]
            if User.objects.filter(username=username).exists():
                self.stdout.write(f"  skip  {username} (already exists)")
                continue
            User.objects.create_user(**data)
            self.stdout.write(self.style.SUCCESS(f"  created  {username}"))

        self.stdout.write(self.style.SUCCESS("Test users ready."))
