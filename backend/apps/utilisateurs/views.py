from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.historique.models import Historique

from .models import Utilisateur
from .serializers import (
    CompleterProfilSerializer,
    InscriptionBeneficiaireSerializer,
    InscriptionDeclarantSerializer,
    UtilisateurSerializer,
)


@api_view(['POST'])
def verifier_inscription(request):
    """
    Règle transversale du cahier des charges (section 7.A) : dès qu'un
    utilisateur clique sur "Chercher une CNI" ou "Publier une CNI", le
    système vérifie d'abord s'il est déjà inscrit, via son téléphone.

    Entrée attendue : {"telephone": "..."}
    """
    telephone = request.data.get('telephone')
    if not telephone:
        return Response(
            {"erreur": "Le numéro de téléphone est requis."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    utilisateur = Utilisateur.objects.filter(telephone=telephone).first()
    if utilisateur:
        return Response({
            "inscrit": True,
            "utilisateur": UtilisateurSerializer(utilisateur).data,
        })
    return Response({"inscrit": False})


@api_view(['POST'])
def inscrire_declarant(request):
    """Inscription via "J'ai trouvé une CNI" (section 6.1, étape 2)."""
    serializer = InscriptionDeclarantSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    utilisateur = serializer.save()
    Historique.enregistrer(
        utilisateur=utilisateur,
        type_action=Historique.TypeAction.INSCRIPTION,
        description=f"Inscription d'un déclarant ({utilisateur.prenom} {utilisateur.nom})",
    )
    return Response(
        UtilisateurSerializer(utilisateur).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
def inscrire_beneficiaire(request):
    """Inscription via "Chercher une CNI" (section 6.2, étape 2)."""
    serializer = InscriptionBeneficiaireSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    utilisateur = serializer.save()
    Historique.enregistrer(
        utilisateur=utilisateur,
        type_action=Historique.TypeAction.INSCRIPTION,
        description=f"Inscription d'un bénéficiaire ({utilisateur.prenom} {utilisateur.nom})",
    )
    return Response(
        UtilisateurSerializer(utilisateur).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['PATCH'])
def completer_profil(request, telephone):
    """
    Section 7.A : un bénéficiaire déjà inscrit complète ville/quartier
    avant de publier une annonce.
    """
    utilisateur = Utilisateur.objects.filter(telephone=telephone).first()
    if not utilisateur:
        return Response(
            {"erreur": "Utilisateur introuvable."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = CompleterProfilSerializer(utilisateur, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UtilisateurSerializer(utilisateur).data)