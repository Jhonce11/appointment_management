import uuid
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Appointment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("scheduled_at", models.DateTimeField()),
                ("supplier", models.CharField(
                    choices=[("A", "Proveedor A"), ("B", "Proveedor B"), ("C", "Proveedor C")],
                    max_length=1,
                )),
                ("product_line", models.CharField(
                    choices=[
                        ("shirts", "Camisetas"),
                        ("pants", "Pantalones"),
                        ("shoes", "Zapatos"),
                        ("accessories", "Accesorios"),
                    ],
                    max_length=20,
                )),
                ("status", models.CharField(
                    choices=[
                        ("scheduled", "Programada"),
                        ("in_progress", "En proceso"),
                        ("delivered", "Entregada"),
                        ("cancelled", "Cancelada"),
                    ],
                    default="scheduled",
                    max_length=20,
                )),
                ("delivered_at", models.DateTimeField(blank=True, null=True)),
                ("observations", models.TextField(blank=True, default="")),
                ("created_by", models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name="appointments",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "appointments_appointment",
                "ordering": ["-scheduled_at"],
            },
        ),
        migrations.AddIndex(
            model_name="appointment",
            index=models.Index(fields=["scheduled_at"], name="idx_appointment_scheduled_at"),
        ),
        migrations.AddIndex(
            model_name="appointment",
            index=models.Index(fields=["status"], name="idx_appointment_status"),
        ),
        migrations.AddIndex(
            model_name="appointment",
            index=models.Index(fields=["supplier"], name="idx_appointment_supplier"),
        ),
        migrations.AddIndex(
            model_name="appointment",
            index=models.Index(fields=["product_line"], name="idx_appointment_product_line"),
        ),
    ]
