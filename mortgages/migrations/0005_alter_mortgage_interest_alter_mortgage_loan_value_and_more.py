# Generated by Django 4.0.3 on 2022-03-07 01:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mortgages', '0004_alter_mortgage_ltv'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mortgage',
            name='interest',
            field=models.IntegerField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='mortgage',
            name='loan_value',
            field=models.IntegerField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='mortgage',
            name='term_expiry',
            field=models.DateTimeField(default=None, null=True),
        ),
    ]