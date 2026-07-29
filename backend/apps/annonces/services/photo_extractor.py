import base64

import cv2


class ServicePhotoExtractor:
    """
    Découpe la photo du titulaire sur le recto. Zone standard validée
    visuellement sur ce modèle de CNI camerounaise.
    """

    def extraire_base64(self, image_recto_brute):
        hauteur, largeur = image_recto_brute.shape[:2]
        x_debut, x_fin = int(largeur * 0.35), int(largeur * 0.75)
        y_debut, y_fin = int(hauteur * 0.25), int(hauteur * 0.70)

        zone_photo = image_recto_brute[y_debut:y_fin, x_debut:x_fin]
        succes, buffer = cv2.imencode('.jpg', zone_photo)
        return base64.b64encode(buffer).decode('utf-8') if succes else ""