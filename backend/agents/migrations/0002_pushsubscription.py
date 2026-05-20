from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('agents', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PushSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('endpoint', models.TextField(verbose_name='Endpoint push')),
                ('p256dh', models.CharField(max_length=255, verbose_name='Clé p256dh')),
                ('auth', models.CharField(max_length=255, verbose_name='Secret auth')),
                ('subscription_json', models.JSONField(verbose_name="Payload d'abonnement complet")),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('agent', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='push_subscription', to='agents.agent', verbose_name='Agent abonné')),
            ],
            options={
                'verbose_name': 'Abonnement Push',
                'verbose_name_plural': 'Abonnements Push',
            },
        ),
    ]
