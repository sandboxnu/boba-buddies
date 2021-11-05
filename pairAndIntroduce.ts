import { App } from '@slack/bolt';
import { ChatPostMessageResponse, ConversationsOpenResponse } from '@slack/web-api';
import generatePairs from './utils/generatePairs';
require('dotenv').config();

const INTRO_MSG = "Say hi to your boba buddy!"
const ICEBREAKER_1 = "What's your hot take?"
const ICEBREAKER_2 = "What's your favorite fruit?"
const ICEBREAKER_3 = "Last song you listened to?"
const ICEBREAKER_4 = "Best/worst professor at NEU?"
const ICEBREAKER_5 = "Favorite pizza topping?"
const ICEBREAKER_6 = "Favorite drink?"
const ICEBREAKER_7 = "If all of Sandbox was on a deserted island, who would be the last to survive?"
const ICEBREAKER_8 = "What's your enneagram/MBTI?"
const ICEBREAKER_9 = "If you were a potato, how would you like to be cooked?"
const ICEBREAKER_10 = "What hobbies do you have (outside of Sandbox)?"
const ICEBREAKERS = [ICEBREAKER_1, ICEBREAKER_2, ICEBREAKER_3, ICEBREAKER_4, ICEBREAKER_5, ICEBREAKER_6, ICEBREAKER_7, ICEBREAKER_8, ICEBREAKER_9, ICEBREAKER_10]

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN // add this
});

export const startConversations = async (app: App) => {
  const pairs = await generatePairs(app);
  // iterate through all pairs to open a DM and send an intro message
  for (const pair of pairs) {
    let thirdUser = "";
    // account for potential group of 3
    if (pair.length > 2) {
      thirdUser = "," + pair[2];
    }
    // generate users string
    const users: string = `${pair[0]},${pair[1]}${thirdUser}`;

    // open DM between users
    const conversationResponse: ConversationsOpenResponse = await app.client.conversations.open({users: users});
    if (!conversationResponse.ok) {
      console.log(`Conversation could not be opened. Error: ${conversationResponse.error}`);
    }

    // get DM conversation id from the response
    if (conversationResponse.channel) {
      const conversationId: string = conversationResponse.channel.id as string;
      // post messages to convo id
      const introMessageResponse: ChatPostMessageResponse = await app.client.chat.postMessage({channel: conversationId, text: INTRO_MSG});
      const icebreaker = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
      const icebreakerResponse: ChatPostMessageResponse = await app.client.chat.postMessage({channel: conversationId, text: icebreaker});
    }
  }
}