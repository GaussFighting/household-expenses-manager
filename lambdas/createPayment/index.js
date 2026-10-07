import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  try {
    console.log("EVENT:", JSON.stringify(event));

    const body = JSON.parse(event.body || "{}");

    console.log("BODY:", JSON.stringify(body));

    const { dueDate, flatName, notes, paymentType, value } = body;

    const paymentTypeResult = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_PAYMENT_TYPES,
        Key: { uuid: paymentType },
      }),
    );

    if (!paymentTypeResult.Item) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid payment type",
        }),
      };
    }

    const numericValue = Number(value);

    const params = {
      TableName: process.env.TABLE_PAYMENTS,
      Item: {
        uuid: randomUUID(),
        paymentGroup: "ALL",
        dueDate,
        flatName,
        notes,
        paymentType,
        value: numericValue,
      },
    };

    await docClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Payment created successfully",
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
