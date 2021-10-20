import { App } from '@slack/bolt';
import generatePairs from './utils/generatePairs';

// maybe want mapping/container of intro messages/icebreakers to 
// send so it can be randomized? is this even supposed be here...
// for now test constants :DDDD
const TESTING_INTRO_MSG = "Say hi to your boba buddy!"
const TESTING_ICEBREAKER = "What's your favorite boba flavor?"

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN // add this
});

const promisedPairs = generatePairs(app);

// i have no clue if im supposed to make a separate file for this or where to
// call it from but yayyyy
const startConversations = async (app: App) => {
  const pairs = await promisedPairs;
  // iterate through all pairs to open a DM and send an intro message
  // is it necessary to add the slackbot as a user in the convo?? i think not but maybe.
  // do all of this here??? or separate the logic for opening dms and sending first intro msgs
  // ?????????????????????
  pairs.forEach(async pair => {
    var thirdUser = "";
    // account for potential group of 3
    if (pair.length > 2) {
      thirdUser = "," + pair[2];
    }
    // generate users string
    const users = pair[0] + "," + pair[1] + thirdUser;
   
    // open DM between users
    const conversationResponse = await app.client.conversations.open(users);

    if (!conversationResponse.ok) {
      // do some error handling stuff
    }
    // get dm conversation id from the response
    const conversationId: string = conversationResponse.channel.id;

    // post messages to above convo id 
    // blocks for prettier/more interactive messages? text for now hehe
    const introMessageResponse = await app.client.chat.postMessage(conversationId, {text: TESTING_INTRO_MSG});
    const icebreakerResponse = await app.client.chat.postMessage(conversationId, {text: TESTING_ICEBREAKER});

    // mroe error handling
  });
}