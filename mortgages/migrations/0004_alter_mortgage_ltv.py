# Generated by Django 4.0.3 on 2022-03-07 01:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mortgages', '0003_alter_mortgage_term_expiry'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mortgage',
            name='LTV',
            field=models.IntegerField(default=None, null=True),
        ),
    ]
