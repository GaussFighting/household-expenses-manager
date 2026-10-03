import crypto from "crypto";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://d22lbbpxtf9zwk.cloudfront.net",
  ];

  const origin = event.headers?.origin || event.headers?.Origin;

  const corsHeaders = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  if (allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }
  try {
    console.log("LOGIN Lambda started");

    const body = JSON.parse(event.body || "{}");
    const { username, password } = body;

    console.log("Username:", username);
    console.log("Password provided:", !!password);
    console.log(
      "Cognito Client ID configured:",
      !!process.env.COGNITO_CLIENT_ID,
    );
    console.log(
      "Cognito Client Secret configured:",
      !!process.env.COGNITO_CLIENT_SECRET,
    );

    if (!username || !password) {
      console.log("Missing username or password");

      return {
        statusCode: 403,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Invalid credentials",
        }),
      };
    }

    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Cognito client ID or client secret is missing");
    }

    const secretHash = crypto
      .createHmac("sha256", clientSecret)
      .update(username + clientId)
      .digest("base64");

    console.log("SECRET_HASH generated successfully");
    console.log("Calling Cognito...");

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await cognito.send(command);

    console.log("Cognito authentication successful");
    const accessToken = response.AuthenticationResult.AccessToken;
    const ttl = response.AuthenticationResult.ExpiresIn;

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Set-Cookie": `accessToken=${encodeURIComponent(
          accessToken,
        )}; Max-Age=${ttl}; Path=/; HttpOnly; Secure; SameSite=None`,
      },
      body: JSON.stringify({
        ttl,
      }),
    };
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    return {
      statusCode: 403,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Invalid credentials",
      }),
    };
  }
};
