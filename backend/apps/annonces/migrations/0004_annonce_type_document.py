from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annonces', '0003_alter_annonce_position_precision'),
    ]

    operations = [
        migrations.AddField(
            model_name='annonce',
            name='type_document',
            field=models.CharField(
                choices=[
                    ('cni', "Carte Nationale d'Identité"),
                    ('passeport', 'Passeport'),
                ],
                db_index=True,
                default='cni',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='annonce',
            name='numero_carte',
            field=models.CharField(
                help_text='Numéro de la CNI ou du passeport.',
                max_length=50,
                verbose_name='numéro du document',
            ),
        ),
        migrations.AlterField(
            model_name='annonce',
            name='photo_verso',
            field=models.ImageField(
                blank=True,
                help_text='Obligatoire pour une CNI, absente pour un passeport.',
                null=True,
                upload_to='cni/verso/',
            ),
        ),
    ]
