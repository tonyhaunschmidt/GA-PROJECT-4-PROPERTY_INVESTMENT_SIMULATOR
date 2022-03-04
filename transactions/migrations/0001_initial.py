# Generated by Django 4.0.3 on 2022-03-04 02:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('properties', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('property_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='properties.property')),
            ],
        ),
    ]
