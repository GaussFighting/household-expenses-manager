const dummyDataPayments = [
  {
    uuid: "8f4e3d9a-8b1d-4c6e-a6a7-2d9f1b8c4e22",
    dueDate: "2025-12-31T00:00:00Z",
    flatName: "Flat2",
    notes: "last two days of December",
    paymentType: "421c7815-905b-48c8-8516-603ec8630548",
    value: 65.76,
  },
];

export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(dummyDataPayments),
  };
};
