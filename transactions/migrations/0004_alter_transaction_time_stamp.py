# Generated by Django 4.0.3 on 2022-03-07 21:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0003_transaction_property_ownership_term'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='time_stamp',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
