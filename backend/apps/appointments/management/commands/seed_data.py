import random
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import Appointment


SEED_APPOINTMENTS = [
    ("A", "shirts",      "scheduled",    3),
    ("A", "pants",       "in_progress",  2),
    ("A", "shoes",       "delivered",    2),
    ("A", "accessories", "cancelled",    1),
    ("B", "shirts",      "delivered",    3),
    ("B", "pants",       "scheduled",    2),
    ("B", "shoes",       "in_progress",  1),
    ("B", "accessories", "delivered",    2),
    ("C", "shirts",      "cancelled",    1),
    ("C", "pants",       "delivered",    2),
    ("C", "shoes",       "scheduled",    1),
]


class Command(BaseCommand):
    help = "Seeds the database with sample appointments for development"

    def handle(self, *args, **kwargs) -> None:
        if Appointment.objects.exists():
            self.stdout.write("  skip  appointments (data already exists)")
            return

        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.ERROR("No users found. Run create_test_users first."))
            return

        created_count = 0
        for supplier, product_line, status_val, quantity in SEED_APPOINTMENTS:
            for _ in range(quantity):
                days_offset = random.randint(-30, 30)
                scheduled = timezone.now() + timedelta(days=days_offset)
                delivered_at = None

                if status_val == Appointment.Status.DELIVERED:
                    hours_late = random.uniform(0.5, 5.0)
                    delivered_at = scheduled + timedelta(hours=hours_late)
                    scheduled = timezone.now() - timedelta(days=random.randint(1, 30))
                    delivered_at = scheduled + timedelta(hours=hours_late)

                if status_val in (Appointment.Status.SCHEDULED, Appointment.Status.IN_PROGRESS):
                    scheduled = timezone.now() + timedelta(days=random.randint(1, 30))

                if status_val == Appointment.Status.CANCELLED:
                    scheduled = timezone.now() + timedelta(days=random.randint(1, 15))

                Appointment.objects.create(
                    scheduled_at=scheduled,
                    supplier=supplier,
                    product_line=product_line,
                    status=status_val,
                    delivered_at=delivered_at,
                    observations=f"Cita de prueba — {supplier}/{product_line}",
                    created_by=random.choice(users),
                )
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"  created  {created_count} appointments"))
