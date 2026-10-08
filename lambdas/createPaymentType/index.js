import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);
  const groups = JSON.parse(event.requestContext?.authorizer?.groups || "[]");

  if (!groups.includes("Admins")) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Forbidden" }),
    };
  }

  try {
    const body = JSON.parse(event.body || {});
    const { paymentType, s3_img } = body;
    const params = {
      TableName: process.env.TABLE_PAYMENT_TYPES,
      Item: {
        uuid: randomUUID(),
        paymentType,
        s3_img,
      },
    };
    await docClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Payment type created successfully",
        item: params.Item,
      }),
    };
  } catch (error) {
    console.error("DynamoDB error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Failed to create payment",
      }),
    };
  }
};
