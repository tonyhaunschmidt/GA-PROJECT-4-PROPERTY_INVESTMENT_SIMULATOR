# Generated by Django 4.0.3 on 2022-03-03 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='level1_improvement_cost',
            field=models.IntegerField(default=None),
        ),
        migrations.AddField(
            model_name='property',
            name='level2_improvement_cost',
            field=models.IntegerField(default=None),
        ),
    ]
