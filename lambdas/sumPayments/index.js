import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  try {
    const byType = event.queryStringParameters?.byType;
    if (!byType) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Missing payment type",
        }),
      };
    }

    const paymentTypeResult = await docClient.send(
      new GetCommand({
        TableName: "payment-types-develop",
        Key: { uuid: byType },
      }),
    );

    if (!paymentTypeResult.Item) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid payment type" }),
      };
    }
    const data = await docClient.send(
      new QueryCommand({
        TableName: "payments-develop",
        IndexName: "paymentType-index",
        KeyConditionExpression: "paymentType = :paymentType",
        ExpressionAttributeValues: {
          ":paymentType": byType,
        },
      }),
    );
    const sum = (data.Items ?? []).reduce(
      (total, payment) => total + Number(payment.value),
      0,
    );
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        paymentType: byType,
        sum,
      }),
    };
  } catch (error) {
    console.error("DynamoDB sum error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Failed to calculate payments sum",
      }),
    };
  }
};
