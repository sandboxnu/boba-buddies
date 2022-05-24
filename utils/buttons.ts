import { App } from "@slack/bolt";
import { ChatPostMessageResponse } from "@slack/web-api";
import pairings from "./data/pairings.json";

const CheckIn = (convoId: string) => ({
  channel: convoId,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Did you have a chance to connect?",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Yes!  :kekuwu:",
            emoji: true,
          },
          value: "yes",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Nope  :kekcry:",
            emoji: true,
          },
          value: "no",
        },
      ],
    },
  ],
});

export async function sendCheckInDM(app: App) {
  for (const convoID of Object.keys(pairings)) {
    // post messages to convo id
    const checkInMessageResponse: ChatPostMessageResponse =
      await app.client.chat.postMessage(CheckIn(convoID));

    // error logging
    if (!checkInMessageResponse.ok) {
      console.log(
        `Check in message could not be sent. Error: ${checkInMessageResponse.error}`
      );
    }
  }
}
