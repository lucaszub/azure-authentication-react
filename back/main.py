# main.py

from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from auth import verify_token
from middlewares import add_cors_middleware

# OAuth2PasswordBearer est utilisé pour récupérer le token dans les en-têtes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configuration de l'application
app = FastAPI()

origins = ["http://localhost:5173"]  # Liste des origines autorisées pour CORS

# Ajouter les middlewares
add_cors_middleware(app, origins)

@app.post("/api/endpoint")
async def my_api_endpoint(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    return {"message": "Utilisateur authentifié", "user": payload}
