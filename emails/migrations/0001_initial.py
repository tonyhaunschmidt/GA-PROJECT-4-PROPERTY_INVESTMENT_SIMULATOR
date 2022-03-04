# Generated by Django 4.0.3 on 2022-03-04 13:44

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Email',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subject', models.CharField(default=None, max_length=300)),
                ('body', models.TextField(default=None, max_length=3000)),
                ('read', models.BooleanField(default=None)),
                ('time_stamp', models.DateTimeField(default=None)),
            ],
        ),
    ]
