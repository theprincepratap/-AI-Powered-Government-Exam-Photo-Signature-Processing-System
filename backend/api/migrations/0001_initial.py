"""Initial migration for photo and signature submission models."""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies: list = []

    operations = [
        migrations.CreateModel(
            name="PhotoSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("applicant_id", models.CharField(max_length=64)),
                ("source", models.ImageField(upload_to="uploads/photos/")),
                ("background_removed", models.ImageField(blank=True, null=True, upload_to="processed/photos/")),
                ("metadata", models.JSONField(blank=True, default=dict)),
            ],
            options={"abstract": False},
        ),
        migrations.CreateModel(
            name="SignatureSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("applicant_id", models.CharField(max_length=64)),
                ("source", models.ImageField(upload_to="uploads/signatures/")),
                ("extracted", models.ImageField(blank=True, null=True, upload_to="processed/signatures/")),
                ("metadata", models.JSONField(blank=True, default=dict)),
            ],
            options={"abstract": False},
        ),
        migrations.CreateModel(
            name="ProcessingResult",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("applicant_id", models.CharField(max_length=64)),
                ("is_valid", models.BooleanField(default=False)),
                ("rules_triggered", models.JSONField(blank=True, default=list)),
                (
                    "photo",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="results",
                        to="api.photosubmission",
                    ),
                ),
                (
                    "signature",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="results",
                        to="api.signaturesubmission",
                    ),
                ),
            ],
            options={"abstract": False},
        ),
    ]
