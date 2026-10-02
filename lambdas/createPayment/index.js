import { randomUUID } from "crypto";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    console.log("EVENT:", JSON.stringify(event));
    const body = JSON.parse(event.body || "{}");
    console.log("BODY:", JSON.stringify(body));
    const { dueDate, flatName, notes, paymentType, value } = body;

    const paymentTypeResult = await docClient.send(
      new GetCommand({
        TableName: "payment-types",
        Key: { uuid: paymentType },
      }),
    );

    if (!paymentTypeResult.Item) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Invalid payment type",
        }),
      };
    }

    const params = {
      TableName: "payments-develop",
      Item: {
        uuid: randomUUID(),
        paymentGroup: "ALL",
        dueDate,
        flatName,
        notes,
        paymentType,
        value,
      },
    };
    await docClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Payment created successfully",
        item: params.Item,
      }),
    };
  } catch (error) {
    console.error("DynamoDB error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Failed to create payment",
      }),
    };
  }
};
