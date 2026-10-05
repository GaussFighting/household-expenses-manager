import { CognitoJwtVerifier } from "aws-jwt-verify";
import { getCorsHeaders } from "../utils/cors.js";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "access",
  clientId,
});

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  console.log("PING EVENT:", JSON.stringify(event));

  try {
    const cookieHeader = event.headers?.Cookie || event.headers?.cookie;

    console.log("Cookie exists:", !!cookieHeader);

    if (!cookieHeader) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    const cookies = cookieHeader.split(";");

    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken="),
    );

    console.log("accessToken cookie exists:", !!accessTokenCookie);

    if (!accessTokenCookie) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    const accessToken = accessTokenCookie
      .trim()
      .substring("accessToken=".length);

    if (!accessToken) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    await verifier.verify(decodeURIComponent(accessToken));

    console.log("Access token is valid");

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "pong",
      }),
    };
  } catch (error) {
    console.error("Token verification failed:", error.message);

    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Unauthorized",
      }),
    };
  }
};
