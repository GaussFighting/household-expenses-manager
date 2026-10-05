import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  try {
    const queryParams = event.queryStringParameters || {};

    if (Object.keys(queryParams).length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Query parameters are not allowed",
        }),
      };
    }

    const params = {
      TableName: "payment-types-develop",
    };

    const data = await docClient.send(new ScanCommand(params));

    console.log("data:", JSON.stringify(data));

    const response = {
      items: data.Items || [],
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("DynamoDB error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Failed to retrieve payment types.",
      }),
    };
  }
};
