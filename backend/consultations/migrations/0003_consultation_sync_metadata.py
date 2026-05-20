from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('consultations', '0002_consultation_poids_patient'),
    ]

    operations = [
        migrations.AddField(
            model_name='consultation',
            name='client_uuid',
            field=models.CharField(blank=True, db_index=True, max_length=36, null=True, verbose_name='Identifiant client (UUID)'),
        ),
        migrations.AddField(
            model_name='consultation',
            name='updated_at_client',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Dernière modification client'),
        ),
        migrations.AddField(
            model_name='consultation',
            name='version',
            field=models.PositiveIntegerField(default=1, verbose_name='Version de la fiche'),
        ),
        migrations.AddConstraint(
            model_name='consultation',
            constraint=models.UniqueConstraint(
                condition=models.Q(('client_uuid__isnull', False)),
                fields=('agent', 'client_uuid'),
                name='unique_consultation_client_uuid_per_agent',
            ),
        ),
    ]
