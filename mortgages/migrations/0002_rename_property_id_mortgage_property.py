# Generated by Django 4.0.3 on 2022-03-04 02:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mortgages', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mortgage',
            old_name='property_id',
            new_name='property',
        ),
    ]
