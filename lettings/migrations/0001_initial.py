# Generated by Django 4.0.3 on 2022-03-04 16:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('properties', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Letting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current', models.BooleanField(default=None)),
                ('grade', models.CharField(default=None, max_length=1)),
                ('void', models.BooleanField(default=None)),
                ('rent_percentage_fee', models.IntegerField(default=None)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lettings', to='properties.property')),
            ],
        ),
    ]
