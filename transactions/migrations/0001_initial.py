# Generated by Django 4.0.3 on 2022-03-04 16:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('properties', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(default=None, max_length=60)),
                ('amount', models.IntegerField(default=None)),
                ('stamp_duty', models.IntegerField(default=None)),
                ('legal_fees', models.IntegerField(default=None)),
                ('time_stamp', models.DateTimeField(default=None)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to=settings.AUTH_USER_MODEL)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='properties.property')),
            ],
        ),
    ]
