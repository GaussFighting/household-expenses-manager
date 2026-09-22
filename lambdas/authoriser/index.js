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
    const headers = event.headers || {};

    const cookieHeader = headers.Cookie || headers.cookie;

    if (!cookieHeader) {
      console.log("Cookie header is missing");
      throw new Error("Unauthorized");
    }
    console.log("event.headers:", event.headers);
    console.log("Cookie header received");

    const cookies = cookieHeader.split(";");

    const accessTokenCookie = cookies.find((cookie) => {
      return cookie.trim().startsWith("accessToken=");
    });

    if (!accessTokenCookie) {
      console.log("accessToken cookie is missing");
      throw new Error("Unauthorized");
    }

    const accessToken = accessTokenCookie
      .trim()
      .substring("accessToken=".length);

    if (!accessToken) {
      console.log("accessToken cookie is empty");
      throw new Error("Unauthorized");
    }

    console.log("Verifying Cognito access token...");

    const payload = await verifier.verify(decodeURIComponent(accessToken));

    const methodArnParts = event.methodArn.split("/");
    const apiArn = methodArnParts[0];
    const stage = methodArnParts[1];

    console.log("JWT is valid");
    console.log("Subject:", payload.sub);
    console.log("Authorizer methodArn:", event.methodArn);
    console.log("Authorizer principalId:", payload.sub);
    console.log("Returning Allow policy");

    const resource = `${apiArn}/${stage}/*/*`;
    return {
      principalId: payload.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: resource,
          },
        ],
      },
    };
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    throw new Error("Unauthorized");
  }
};
