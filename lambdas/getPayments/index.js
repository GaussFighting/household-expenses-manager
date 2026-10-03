import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ALLOWED_SORT_FIELDS = ["paymentType", "value", "notes", "flatName"];

const allowedOrigins = [
  "http://localhost:3000",
  "https://d22lbbpxtf9zwk.cloudfront.net",
];

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;

  const corsHeaders = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Content-Type": "application/json",
  };

  if (allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }
  try {
    const limit = Number(event?.queryStringParameters?.limit || 5);

    const nextToken = event?.queryStringParameters?.nextToken;
    const sortByParam = event?.queryStringParameters?.sortBy;

    let sortBy = [];

    if (sortByParam) {
      sortBy = sortByParam.split(",").map((field) => field.trim());

      const invalidFields = sortBy.filter(
        (field) => !ALLOWED_SORT_FIELDS.includes(field),
      );
      if (invalidFields.length > 0) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Invalid sortBy field",
            allowedFields: ALLOWED_SORT_FIELDS,
          }),
        };
      }
    }

    const countData = await docClient.send(
      new ScanCommand({
        TableName: "payments-develop",
        Select: "COUNT",
      }),
    );

    const params = {
      TableName: "payments-develop",
      IndexName: "dueDate-index",
      KeyConditionExpression: "paymentGroup = :paymentGroup",
      ExpressionAttributeValues: {
        ":paymentGroup": "ALL",
      },
      ScanIndexForward: false,
      Limit: limit,
    };

    if (nextToken) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(nextToken, "base64").toString("utf-8"),
      );
    }

    const data = await docClient.send(new QueryCommand(params));

    console.log("data:", JSON.stringify(data));

    let items = data.Items || [];

    if (sortBy.length > 0) {
      items.sort((a, b) => {
        for (const field of sortBy) {
          let valueA = a[field];
          let valueB = b[field];

          if (field === "value") {
            valueA = Number(valueA);
            valueB = Number(valueB);
          }

          if (valueA == null && valueB == null) {
            continue;
          }

          if (valueA == null) {
            return 1;
          }

          if (valueB == null) {
            return -1;
          }

          if (valueA < valueB) {
            return -1;
          }

          if (valueA > valueB) {
            return 1;
          }
        }

        return 0;
      });
    }

    const responseNextToken = data.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString("base64")
      : null;

    const response = {
      items,
      count: countData.Count || 0,
      nextToken: responseNextToken,
    };

    console.log("response:", JSON.stringify(response));

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
        message: "Failed to retrieve payments.",
      }),
    };
  }
};
