import crypto from "crypto";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event) => {
  try {
    console.log("LOGIN Lambda version: SECRET_HASH_TEST_1");
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        accessToken: response.AuthenticationResult.AccessToken,
        ttl: response.AuthenticationResult.ExpiresIn,
      }),
    };
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Invalid credentials",
      }),
    };
  }
};
