import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
export const snsClient = new SNSClient({});

export const handler = async (event) => {
  const record = event.Records[0];
  const messageId = record.messageId;

  const receiveCount = Number(record.attributes.ApproximateReceiveCount);
  console.log("Message ID:", messageId);
  console.log("Receive count:", receiveCount);
  try {
    // throw new Error("TEST FAILURE");  // for test purpose
    const response = await snsClient.send(
      new PublishCommand({
        TopicArn:
          "arn:aws:sns:eu-central-1:875521761456:expenses-manager-notifications",
        Subject: "New notification",
        Message: "Test from lamba call Reminder",
      }),
    );
    console.log(response);
    return { succes: true };
  } catch (error) {
    if (receiveCount >= 2) {
      console.error("Failed to send SNS email notification:", error);
      return;
    }
    throw error;
  }
};
