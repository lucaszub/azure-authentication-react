import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import "./App.css";

const App = () => {
  const { instance, accounts } = useMsal();
  const [backendResponse, setBackendResponse] = useState(null);

  const handleLogin = async () => {
    try {
      await instance.loginPopup({
        scopes: [
          "openid",
          "profile",
          "email",
          "https://authtestlucas.onmicrosoft.com/test/auth",
        ],
      });
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
  };

  const sendToBackend = async () => {
    try {
      const request = {
        scopes: ["https://authtestlucas.onmicrosoft.com/test/auth"],
      };
      const tokenResponse = await instance.acquireTokenPopup(request);
      const accessToken = tokenResponse.accessToken;

      if (!accessToken) {
        console.error("Aucun access token trouvé");
        return;
      }

      const response = await fetch("http://localhost:8000/api/endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user: accounts[0]?.idTokenClaims.given_name,
        }),
      });

      if (!response.ok) {
        console.error("Erreur côté serveur", response.statusText);
        const errorData = await response.json();
        console.error("Détails de l'erreur:", errorData);
        return;
      }

      const data = await response.json();
      setBackendResponse(data.user.name);
    } catch (error) {
      console.error("Erreur lors de l'envoi au backend:", error);
    }
  };

  return (
    <div className="app-container">
      <h1>Azure AD B2C Auth Test</h1>
      {accounts.length > 0 ? (
        <>
          <div className="account-info">
            <p>
              Information recupéré avec Azure : Connecté en tant que{" "}
              {accounts[0]?.idTokenClaims.name || "Utilisateur inconnu"}
            </p>
            {/* <p> id token {accounts[0].idToken}</p> */}
          </div>
          <button onClick={handleLogout}>Se déconnecter</button>
          <button onClick={sendToBackend}>Envoyer au Backend</button>
          {backendResponse && (
            <div className="backend-response">
              <h2>Réponse du backend :</h2>
              <p>{backendResponse}</p>
            </div>
          )}
        </>
      ) : (
        <button onClick={handleLogin}>Se connecter</button>
      )}
    </div>
  );
};

export default App;
