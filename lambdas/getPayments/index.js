import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const limit = Number(event?.queryStringParameters?.limit || 5);

    const nextToken = event?.queryStringParameters?.nextToken;

    const countData = await docClient.send(
      new ScanCommand({
        TableName: "payments-develop",
        Select: "COUNT",
      }),
    );

    const params = {
      TableName: "payments-develop",
      Limit: limit,
    };

    if (nextToken) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(nextToken, "base64").toString("utf-8"),
      );
    }

    const data = await docClient.send(new ScanCommand(params));

    console.log("data:", JSON.stringify(data));

    const responseNextToken = data.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString("base64")
      : null;

    const response = {
      items: data.Items || [],
      count: countData.Count || 0,
      nextToken: responseNextToken,
    };

    console.log("response:", JSON.stringify(response));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify(response),
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
        message: "Failed to retrieve payments.",
      }),
    };
  }
};
