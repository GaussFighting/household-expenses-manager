const dummyDataPaymentTypes = [
  {
    uuid: "6a98e98e-f457-4b21-b393-95bb00d865f9",
    name: "Internet",
    image: "s3IImage",
  },
  {
    uuid: "9409a38e-a890-4c63-afc0-d79b32ec575c",
    name: "Renovation Fund",
    image: "s3RFImage",
  },
  {
    uuid: "421c7815-905b-48c8-8516-603ec8630548",
    name: "Utilities and Maintenance",
    image: "s3UaMImage",
  },
  {
    uuid: "a8f1abb0-c30a-47f1-9b1b-c5e9fa0ebd5e",
    name: "Special Purpose Fund",
    image: "s3SPFImage",
  },
  {
    uuid: "78d6453e-a031-40e9-8ba3-f0900b4dc9c8",
    name: "Property Tax",
    image: "s3PTImage",
  },
  {
    uuid: "b4473a3e-dfc9-4044-9a2c-aaae56b2b461",
    name: "Electricity",
    image: "s3EImage",
  },
];

export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(dummyDataPaymentTypes),
  };
};
