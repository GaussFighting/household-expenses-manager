import { getCorsHeaders } from "../utils/cors.js";

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  const response = {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify("Hello from Lambda! getPaymentType"),
  };
  return response;
};
