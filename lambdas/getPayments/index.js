import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const params = {
      TableName: "payments-develop",
    };
    const data = await docClient.send(new ScanCommand(params));
    console.log("data:", JSON.stringify(data));

    const response = {
      items: data.Items || [],
    };

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
