import { PublicClientApplication } from "@azure/msal-browser";

// Configuration de MSAL pour l'authentification Azure AD B2C
const msalConfig = {
  auth: {
    clientId: "<clientId>", // Remplacez par l'ID de votre application
    authority: `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policyName>`, // Remplacez <tenant> par le nom de votre locataire et <policyName> par le nom de votre politique B2C (ex : B2C_1_signinsignup)
    knownAuthorities: [`<tenant>.b2clogin.com`], // Remplacez <tenant> par le nom de votre locataire
    redirectUri: "<redirectUri>", // Remplacez par l'URL de redirection, ex : http://localhost:5173
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
