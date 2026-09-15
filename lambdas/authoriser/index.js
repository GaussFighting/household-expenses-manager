import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

if (!userPoolId) {
  throw new Error("COGNITO_USER_POOL_ID is not configured");
}

if (!clientId) {
  throw new Error("COGNITO_CLIENT_ID is not configured");
}

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "access",
  clientId,
});

export const handler = async (event) => {
  console.log("Authoriser started");

  try {
    const authorizationToken = event.authorizationToken;

    if (!authorizationToken) {
      console.log("Authorization token is missing");
      throw new Error("Unauthorized");
    }

    const parts = authorizationToken.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("Invalid Authorization header format");
      throw new Error("Unauthorized");
    }

    const accessToken = parts[1];

    console.log("Verifying Cognito access token...");

    const payload = await verifier.verify(accessToken);

    console.log("JWT is valid");
    console.log("Subject:", payload.sub);

    return {
      principalId: payload.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.methodArn,
          },
        ],
      },
    };
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    throw new Error("Unauthorized");
  }
};
