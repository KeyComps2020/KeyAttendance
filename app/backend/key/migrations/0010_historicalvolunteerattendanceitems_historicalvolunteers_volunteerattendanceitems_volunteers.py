# Generated by Django 2.1.7 on 2020-05-12 19:41

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import key.helpers
import simple_history.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('key', '0009_auto_20200420_1851'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoricalVolunteerAttendanceItems',
            fields=[
                ('volunteer_id', models.IntegerField(blank=True, null=True)),
                ('date', models.DateField(default=key.helpers.getCurrentDate)),
                ('check_in', models.TimeField(default=key.helpers.getCurrentTime)),
                ('check_out', models.TimeField(blank=True, null=True)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('description', models.CharField(blank=True, max_length=20000, null=True)),
                ('visit_number', models.IntegerField(blank=True, null=True)),
                ('id', models.IntegerField(blank=True, db_index=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField()),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'historical volunteer attendance items',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': 'history_date',
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalVolunteers',
            fields=[
                ('first_name', models.TextField(blank=True, null=True)),
                ('last_name', models.TextField(blank=True, null=True)),
                ('id', models.IntegerField(blank=True, db_index=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField()),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'historical volunteers',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': 'history_date',
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='VolunteerAttendanceItems',
            fields=[
                ('volunteer_id', models.IntegerField(blank=True, null=True)),
                ('date', models.DateField(default=key.helpers.getCurrentDate)),
                ('check_in', models.TimeField(default=key.helpers.getCurrentTime)),
                ('check_out', models.TimeField(blank=True, null=True)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('description', models.CharField(blank=True, max_length=20000, null=True)),
                ('visit_number', models.IntegerField(blank=True, null=True)),
                ('id', models.AutoField(primary_key=True, serialize=False, unique=True)),
            ],
            options={
                'db_table': 'volunteerattendance',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='Volunteers',
            fields=[
                ('first_name', models.TextField(blank=True, null=True)),
                ('last_name', models.TextField(blank=True, null=True)),
                ('id', models.AutoField(primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'volunteers',
                'managed': True,
            },
        ),
    ]
