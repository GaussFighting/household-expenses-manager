import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getCorsHeaders } from "../utils/cors.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const allowFields = ["dueDate", "flatName", "notes", "paymentType", "value"];

export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  try {
    const uuid = event.queryStringParameters?.uuid;

    if (!uuid) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Payment UUID is required",
        }),
      };
    }

    const body = JSON.parse(event.body || {});

    const updateFields = Object.keys(body).filter((field) =>
      allowFields.includes(field),
    );

    if (!updateFields.length) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "No valid fields to update" }),
      };
    }

    const updateExpression = `SET ${updateFields.map((field) => `#${field} = :${field}`).join(", ")}`;

    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    updateFields.forEach((field) => {
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = body[field];
    });

    const data = await docClient.send(
      new UpdateCommand({
        TableName: "payments-develop",

        Key: {
          uuid,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data.Attributes),
    };
  } catch (error) {
    console.error("DynamoDB update error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Failed to update payment",
      }),
    };
  }
};
