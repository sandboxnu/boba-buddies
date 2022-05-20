import { App } from '@slack/bolt';

require('dotenv').config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN // add this
});

/*
 TODO: implement garbage here
 - check date relative to pairing date
 - if been two weeks => new pairings!
   - if first time pairing (ok this happens once) => generatePairs()
   - else we just want to shift => shiftByOne()
   - send pairs to startConversation()
   - reset the pairing date
 - it's been one week => check in!
   - ok call the checkIn() and pray the lambda handles it
 - someone figure out how to set some timer so this process doesn't run 10 times a second
 */


