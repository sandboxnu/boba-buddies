import { App } from "@slack/bolt";
import { ChatPostMessageResponse, ConversationsOpenResponse } from '@slack/web-api';
import { generatePairs } from "./generatePairs";
import fs from 'fs';

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

export const startConversations = async (app: App) => {

    const pairs = await generatePairs(app);
    const channelAndPairs = new Map<string, string[]>();

    // iterate through all pairs to open a DM and send an intro message
    for (const pair of pairs) {
      // generate users string
      const users: string = pair.join(",");

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

        if (!introMessageResponse.ok) {
          console.log(`Intro message could not be sent. Error: ${introMessageResponse.error}`);
        }
        if (!icebreakerResponse.ok) {
          console.log(`Icebreaker could not be sent. Error: ${icebreakerResponse.error}`);
        }

        channelAndPairs.set(conversationId, pair);
      }

    }
    var storedPairs = JSON.stringify(Array.from(channelAndPairs.entries()));
    fs.writeFileSync('./utils/pairings.json', storedPairs);
  }
