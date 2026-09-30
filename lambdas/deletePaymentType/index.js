export const handler = async (event) => {
  console.log(event);
  console.log("FULL EVENT:", JSON.stringify(event, null, 2));

  console.log("requestContext:", JSON.stringify(event.requestContext, null, 2));

  console.log(
    "authorizer:",
    JSON.stringify(event.requestContext?.authorizer, null, 2),
  );
  const groups = JSON.parse(event.requestContext?.authorizer?.groups || "[]");

  console.log("Groups:", groups);

  if (!groups.includes("Admins")) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Forbidden",
      }),
    };
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda! deletePaymentType"),
  };
  return response;
};
