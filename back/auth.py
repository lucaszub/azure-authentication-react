# auth.py

from jose import jwt
from fastapi import HTTPException
import requests
from config import DISCOVERY_URL, API_CLIENT_ID

# Fonction pour récupérer la configuration OpenID et extraire les clés JWKS
def get_jwks():
    try:
        # Récupérer le document de découverte
        discovery_response = requests.get(DISCOVERY_URL)
        discovery_response.raise_for_status()
        config = discovery_response.json()
        jwks_uri = config.get("jwks_uri")
        if not jwks_uri:
            raise HTTPException(status_code=500, detail="jwks_uri non trouvé dans la configuration OpenID")
        # Appeler l'endpoint JWKS pour récupérer les clés publiques
        jwks_response = requests.get(jwks_uri)
        jwks_response.raise_for_status()
        return jwks_response.json()  # Ceci doit contenir le champ "keys"
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail="Erreur de récupération des clés publiques Azure AD B2C: " + str(e))

# Fonction pour vérifier le token
def verify_token(token: str):
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        if unverified_header is None or "kid" not in unverified_header:
            raise HTTPException(status_code=401, detail="Token invalide")

        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == unverified_header["kid"]:
                rsa_key = {
                    "kty": key.get("kty"),
                    "kid": key.get("kid"),
                    "use": key.get("use"),
                    "n": key.get("n"),
                    "e": key.get("e")
                }
                break

        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=API_CLIENT_ID,
                issuer="https://authtestlucas.b2clogin.com/9d079035-d241-4d83-8c75-c845103488f2/v2.0/",
            )
            return payload
        else:
            raise HTTPException(status_code=401, detail="Clé publique non trouvée pour ce token")
    except jwt.JWTError as e:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré: " + str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur interne: " + str(e))
