const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const handler = async (event) => {
  console.log("CORS LAMBDA HIT");
  const origin = event.headers?.origin || event.headers?.Origin;

  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Content-Type": "application/json",
    "X-CORS-LAMBDA": "true",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return {
    statusCode: 204,
    headers,
    body: "",
  };
};
