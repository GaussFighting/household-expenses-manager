const allowedOrigins = [
  "http://localhost:3000",
  "https://d22lbbpxtf9zwk.cloudfront.net",
];

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

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "pong",
    }),
  };
};
