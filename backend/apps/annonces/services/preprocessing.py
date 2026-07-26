import cv2


class ServicePretraitement:
    """
    Responsabilité unique : améliorer une image brute avant OCR docTR.
    Ne connaît ni docTR, ni la structure d'une CNI.
    """

    def corriger(self, image):
        """Débruitage, contraste adaptatif (CLAHE), renforcement de netteté -- systématique, jamais bloquant."""
        image = cv2.fastNlMeansDenoisingColored(image, None, 7, 7, 7, 21)

        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        lab_corrige = cv2.merge((clahe.apply(l), a, b))
        image = cv2.cvtColor(lab_corrige, cv2.COLOR_LAB2BGR)

        flou = cv2.GaussianBlur(image, (0, 0), sigmaX=3)
        return cv2.addWeighted(image, 1.5, flou, -0.5, 0)