import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const byType = event.queryStringParameters?.byType;
    if (!byType) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Missing payment type",
        }),
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
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentType: byType,
        sum,
      }),
    };
  } catch (error) {
    console.error("DynamoDB sum error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Failed to calculate payments sum",
      }),
    };
  }
};
