# Generated by Django 4.0.3 on 2022-03-07 01:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mortgages', '0005_alter_mortgage_interest_alter_mortgage_loan_value_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mortgage',
            name='LTV',
            field=models.IntegerField(default=None),
        ),
        migrations.AlterField(
            model_name='mortgage',
            name='interest',
            field=models.IntegerField(default=None),
        ),
        migrations.AlterField(
            model_name='mortgage',
            name='loan_value',
            field=models.IntegerField(default=None),
        ),
        migrations.AlterField(
            model_name='mortgage',
            name='term_expiry',
            field=models.DateTimeField(default=None),
        ),
    ]