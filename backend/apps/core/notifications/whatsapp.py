class ServiceNotificationWhatsApp:
    """
    Génère un lien wa.me pré-rempli (cahier des charges : solution
    simple, pas d'API WhatsApp Business payante à ce stade). L'envoi
    réel n'est pas automatisé côté serveur -- le lien est destiné à
    être ouvert côté client ou consulté par l'administrateur.
    """

    def generer_lien(self, telephone, message):
        telephone_normalise = telephone.replace(' ', '').replace('+', '')
        message_encode = message.replace(' ', '%20').replace('\n', '%0A')
        return f"https://wa.me/{telephone_normalise}?text={message_encode}"