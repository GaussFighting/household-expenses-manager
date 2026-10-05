import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  try {
    const uuid = event.queryStringParameters?.uuid;

    if (!uuid) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Missing payment uuid",
        }),
      };
    }
    await docClient.send(
      new DeleteCommand({
        TableName: "payments-develop",
        Key: { uuid },
      }),
    );
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: `Payment of ${uuid} deleted`,
        uuid: uuid,
      }),
    };
  } catch (error) {
    console.error("DynamoDB delete error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Invalid request",
      }),
    };
  }
};
