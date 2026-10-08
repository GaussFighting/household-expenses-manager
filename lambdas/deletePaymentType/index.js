import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);
  console.log(event);
  console.log("FULL EVENT:", JSON.stringify(event, null, 2));
  console.log("requestContext:", JSON.stringify(event.requestContext, null, 2));
  console.log(
    "authorizer:",
    JSON.stringify(event.requestContext?.authorizer, null, 2),
  );

  const groups = JSON.parse(event.requestContext?.authorizer?.groups || "[]");
  console.log("Groups:", groups);

  if (!groups.includes("Admins")) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Forbidden" }),
    };
  }

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

    const paymentUuidExist = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_PAYMENT_TYPES,
        Key: { uuid: uuid },
      }),
    );
    if (!paymentUuidExist.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid payment type uuid",
        }),
      };
    }
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_PAYMENT_TYPES,
        Key: { uuid },
      }),
    );
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: `Payment type of ${uuid} deleted`,
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
