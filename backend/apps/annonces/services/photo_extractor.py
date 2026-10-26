import base64

import cv2

from apps.annonces.services.passeport_config import ZONE_PHOTO_PASSEPORT


class ServicePhotoExtractor:
    """
    Découpe la photo du titulaire sur le recto. Utilise la détection
    de visage Haar Cascade quand disponible, fallback sur coordonnées fixes.
    """

    _cascade = None

    @classmethod
    def _obtenir_cascade(cls):
        if cls._cascade is None:
            chemin = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            cls._cascade = cv2.CascadeClassifier(chemin)
        return cls._cascade

    def _extraire_par_visage(self, image):
        gris = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        cascade = self._obtenir_cascade()
        visages = cascade.detectMultiScale(
            gris, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50),
        )
        if len(visages) == 0:
            return None
        x, y, w, h = max(visages, key=lambda v: v[2] * v[3])
        hauteur, largeur = image.shape[:2]
        mx, myt, myb = int(w * 0.5), int(h * 0.3), int(h * 0.6)
        xd = max(0, x - mx)
        xf = min(largeur, x + w + mx)
        yd = max(0, y - myt)
        yf = min(hauteur, y + h + myb)
        return image[yd:yf, xd:xf]

    def _extraire_par_coordonnees(self, image, type_document='cni'):
        hauteur, largeur = image.shape[:2]
        if type_document == 'passeport':
            r = ZONE_PHOTO_PASSEPORT
            xd, xf = int(largeur * r['x1']), int(largeur * r['x2'])
            yd, yf = int(hauteur * r['y1']), int(hauteur * r['y2'])
            return image[yd:yf, xd:xf]
        xd, xf = int(largeur * 0.35), int(largeur * 0.75)
        yd, yf = int(hauteur * 0.25), int(hauteur * 0.70)
        return image[yd:yf, xd:xf]

    def extraire_base64(self, image_recto_brute, type_document='cni'):
        zone = self._extraire_par_visage(image_recto_brute)
        if zone is None:
            zone = self._extraire_par_coordonnees(image_recto_brute, type_document=type_document)
        if zone is None or getattr(zone, 'size', 0) == 0:
            return ""
        succes, buffer = cv2.imencode('.jpg', zone)
        return base64.b64encode(buffer).decode('utf-8') if succes else ""
