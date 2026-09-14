import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event) => {
  try {
    console.log("LOGIN Lambda started");
    const body = JSON.parse(event.body || "{}");
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Invalid credentials",
        }),
      };
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await cognito.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        accessToken: response.AuthenticationResult.AccessToken,
        ttl: response.AuthenticationResult.ExpiresIn,
      }),
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Invalid credentials",
      }),
    };
  }
};
