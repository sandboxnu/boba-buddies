import { App } from "@slack/bolt";
import {
  ChatPostMessageResponse,
  ConversationsOpenResponse,
} from "@slack/web-api";

const CheckIn = (convoId: string) => ({
  channel: convoId,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":movie_camera: *Meet with Zoom*",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Working remotely? Connect your Zoom account to automatically create Zoom meetings and connect over video!",
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Get Started",
          emoji: true,
        },
        value: "view_alternate_1",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":calendar: *Schedule with Outlook or Google Calendar*",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "If you use Outlook or Google Calendar, you can schedule your donuts directly through Slack! If you haven't linked your calendar yet, click the 'Get started' button to do so.",
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Get Started",
          emoji: true,
        },
        value: "view_alternate_2",
      },
    },
  ],
});

export async function findConversation(app: App) {
  const conversationResponse: ConversationsOpenResponse =
    await app.client.conversations.open({ users: "U02CPHBDP5G,ULY75MW4A" });
  if (!conversationResponse.ok) {
    console.log(
      `Conversation could not be opened. Error: ${conversationResponse.error}`
    );
  }

  // get DM conversation id from the response
  if (conversationResponse.channel) {
    const conversationId: string = conversationResponse.channel.id as string;
    // post messages to convo id
    const introMessageResponse: ChatPostMessageResponse =
      await app.client.chat.postMessage(CheckIn(conversationId));

    if (!introMessageResponse.ok) {
      console.log(
        `Intro message could not be sent. Error: ${introMessageResponse.error}`
      );
    }
  }
}
