import json
import re

from doctr.io import DocumentFile
from doctr.models import ocr_predictor


# ==================================================
# MODELE DOCTR
# ==================================================

model = ocr_predictor(pretrained=True)


# ==================================================
# IMAGE
# ==================================================

document = DocumentFile.from_images(
    [
        "C:/Users/JEM/Pictures/1jo.jpeg"
    ]
)


# ==================================================
# OCR
# ==================================================

result = model(document)



# ==================================================
# RECUPERATION DES MOTS
# ==================================================

words = []


for page in result.pages:

    for block in page.blocks:

        for line in block.lines:

            for word in line.words:

                words.append({

                    "text": word.value.upper().strip(),

                    "confidence": float(word.confidence),

                    "x": word.geometry[0][0],

                    "y": word.geometry[0][1]

                })



# Trier par position verticale puis horizontale

words = sorted(
    words,
    key=lambda w:(w["y"], w["x"])
)



# ==================================================
# LABELS
# ==================================================

labels = [

    "NOM",
    "NAME",
    "SURNAME",
    "NOMISURNAME",

    "PRENOM",
    "PRÉNOM",
    "PRÉNOMSIGIVEN",
    "GIVEN",
    "NAMES",

    "BIRTH",
    "DATE",
    "NAISSANCE",

    "SEX",
    "SEXE"

]



def est_label(texte):

    for label in labels:

        if label in texte:

            return True

    return False




# ==================================================
# CHERCHER APRES UN LABEL
# ==================================================

def chercher_apres(index_label):


    label = words[index_label]


    candidats=[]


    for i in range(index_label + 1, len(words)):


        mot = words[i]


        # ignorer labels

        if est_label(mot["text"]):

            continue



        # ignorer dates

        if re.search(
            r"\d{2}\.\d{2}\.\d{4}",
            mot["text"]
        ):

            continue



        # uniquement même zone basse identité

        if mot["y"] < label["y"]:

            continue



        if mot["confidence"] < 0.80:

            continue



        candidats.append(mot)



    if candidats:

        return candidats[0]


    return None





# ==================================================
# RESULTAT
# ==================================================

data = {

    "nom":"",
    "prenoms":"",
    "numero_cni":"",
    "date_naissance":"",
    "date_expiration":"",
    "sexe":"",

    "confidence":{}

}




# ==================================================
# NUMERO CNI
# ==================================================

for mot in words:


    if re.fullmatch(
        r"\d{9}",
        mot["text"]
    ):


        data["numero_cni"]=mot["text"]

        data["confidence"]["numero_cni"]=mot["confidence"]

        break




# ==================================================
# SEXE
# ==================================================

for mot in words:


    if mot["text"] in ["M","F"]:


        data["sexe"]=mot["text"]

        data["confidence"]["sexe"]=mot["confidence"]

        break





# ==================================================
# DATES
# ==================================================

dates=[]


for mot in words:

    if re.search(
        r"\d{2}\.\d{2}\.\d{4}",
        mot["text"]
    ):

        dates.append(mot)



if len(dates)>=1:

    data["date_naissance"]=dates[0]["text"]

    data["confidence"]["date_naissance"]=dates[0]["confidence"]



if len(dates)>=2:

    data["date_expiration"]=dates[1]["text"]

    data["confidence"]["date_expiration"]=dates[1]["confidence"]





# ==================================================
# NOM
# ==================================================

for index,mot in enumerate(words):


    if "NOMISURNAME" in mot["text"]:


        valeur = chercher_apres(index)


        if valeur:


            data["nom"]=valeur["text"]

            data["confidence"]["nom"]=valeur["confidence"]

            break





# ==================================================
# PRENOMS
# ==================================================

for index,mot in enumerate(words):


    if (
        "PRENOM" in mot["text"]
        or "GIVEN" in mot["text"]
    ):


        valeur = chercher_apres(index)


        if valeur:


            data["prenoms"]=valeur["text"]

            data["confidence"]["prenoms"]=valeur["confidence"]

            break




# ==================================================
# AFFICHAGE
# ==================================================

print(
    json.dumps(
        data,
        indent=4,
        ensure_ascii=False
    )
)