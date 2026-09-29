jest.mock(
  "@aws-sdk/client-dynamodb",
  () => ({
    DynamoDBClient: jest.fn(),
  }),
  { virtual: true },
);

const mockSend = jest.fn();

jest.mock(
  "@aws-sdk/lib-dynamodb",
  () => ({
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
      })),
    },
    QueryCommand: jest.fn(),
  }),

  { virtual: true },
);

const { handler } = require("../lambdas/sumPayments/index.js");

test("returns 400 when byType is missing", async () => {
  const event = {
    queryStringParameters: {},
  };

  const response = await handler(event);

  expect(response.statusCode).toBe(400);
  expect(JSON.parse(response.body)).toEqual({
    message: "Missing payment type",
  });
});

test("returns 400 when queryStringParameters is missing", async () => {
  const response = await handler({});

  expect(response.statusCode).toBe(400);

  expect(JSON.parse(response.body)).toEqual({
    message: "Missing payment type",
  });
});

test("returns sum for payment type", async () => {
  mockSend.mockResolvedValue({
    Items: [{ value: "10" }, { value: "20" }, { value: "5" }],
  });

  const response = await handler({
    queryStringParameters: { byType: "abc123" },
  });
  expect(response.statusCode).toBe(200);

  expect(JSON.parse(response.body)).toEqual({
    paymentType: "abc123",
    sum: 35,
  });
});

test("returns 500 when DynamoDB query fail", async () => {
  mockSend.mockRejectedValue(new Error("DynamoDB Error"));

  const response = await handler({
    queryStringParameters: {
      byType: "abc123",
    },
  });

  expect(response.statusCode).toBe(500);

  expect(JSON.parse(response.body)).toEqual({
    message: "Failed to calculate payments sum",
  });
});
