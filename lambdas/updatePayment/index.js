export const handler = async (event) => {
  try {
    const id = event.queryStringParameters?.id;
    const body = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Missing payment id",
        }),
      };
    }

    const updatedPayment = {
      uuid: id,
      dueDate: body.dueDate,
      flatName: body.flatName,
      notes: body.notes,
      paymentType: body.paymentType,
      value: body.value,
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPayment),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Invalid request",
      }),
    };
  }
};
