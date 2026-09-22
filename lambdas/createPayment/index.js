import { randomUUID } from "crypto";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const payment = {
      uuid: randomUUID(),
      dueDate: body.dueDate,
      flatName: body.flatName,
      notes: body.notes,
      paymentType: body.paymentType,
      value: body.value,
    };

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payment),
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
