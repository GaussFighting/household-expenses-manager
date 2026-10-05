// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://d22lbbpxtf9zwk.cloudfront.net",
// ];

// export const handler = async (event) => {
//   console.log("PING EVENT:", JSON.stringify(event));

//   const origin = event.headers?.origin || event.headers?.Origin;

//   const headers = {
//     "Access-Control-Allow-Credentials": "true",
//     "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
//     "Access-Control-Allow-Methods": "GET,OPTIONS",
//     "Content-Type": "application/json",
//   };

//   if (allowedOrigins.includes(origin)) {
//     headers["Access-Control-Allow-Origin"] = origin;
//   }

//   if (event.httpMethod === "OPTIONS") {
//     return {
//       statusCode: 204,
//       headers,
//       body: "",
//     };
//   }

//   return {
//     statusCode: 200,
//     headers,
//     body: JSON.stringify({
//       message: "pong",
//     }),
//   };
// };

import { CognitoJwtVerifier } from "aws-jwt-verify";

const allowedOrigins = [
  "http://localhost:3000",
  "https://d22lbbpxtf9zwk.cloudfront.net",
];

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "access",
  clientId,
});

export const handler = async (event) => {
  console.log("PING EVENT:", JSON.stringify(event));

  const origin = event.headers?.origin || event.headers?.Origin;

  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Content-Type": "application/json",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  try {
    const cookieHeader = event.headers?.Cookie || event.headers?.cookie;

    console.log("Cookie exists:", !!cookieHeader);

    if (!cookieHeader) {
      return {
        statusCode: 401,
        headers,
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
        headers,
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
        headers,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    await verifier.verify(decodeURIComponent(accessToken));

    console.log("Access token is valid");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "pong",
      }),
    };
  } catch (error) {
    console.error("Token verification failed:", error.message);

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: "Unauthorized",
      }),
    };
  }
};
