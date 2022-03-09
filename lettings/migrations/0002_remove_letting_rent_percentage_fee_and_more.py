# Generated by Django 4.0.3 on 2022-03-08 16:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('lettings', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='letting',
            name='rent_percentage_fee',
        ),
        migrations.AddField(
            model_name='letting',
            name='fixed_void',
            field=models.DateTimeField(default=None),
        ),
        migrations.AddField(
            model_name='letting',
            name='owner',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='lettings', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]