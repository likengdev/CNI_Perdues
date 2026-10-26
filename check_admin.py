import os
import sys

sys.path.insert(0, 'backend')
os.chdir('backend')
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.dev'

import django
django.setup()

from apps.administration.models import Administrateur
try:
    admin = Administrateur.objects.get(email='likeng@gmail.com')
    print('UTILISATEUR TROUVE :', admin)
    print('is_active:', admin.is_active)
    print('is_staff:', admin.is_staff)
    print('email:', admin.email)
    print('nom:', admin.nom)
except Exception as e:
    print('ERREUR:', type(e).__name__, str(e))