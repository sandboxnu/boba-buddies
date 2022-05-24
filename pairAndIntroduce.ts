import { App } from '@slack/bolt';
import { generatePairs, shiftByOne } from './utils/generatePairs';
import { startConversations } from './utils/startConversations';
import { sendCheckInDM } from './utils/buttons';

require('dotenv').config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN // add this
});

const ONE_WEEK_MS = 604800000
let pairingDate = new Date(1652735785000); // TODO: change this to actual start date
let isCheckedIn = false;
let firstPairing = true;

setInterval(async () => {
  const currDate = new Date();

  // @ts-ignore
  if (Math.abs(currDate - pairingDate) > (ONE_WEEK_MS * 2)) { // Two weeks, re-gen pairs
    let pairs;
    if (firstPairing) {
      firstPairing = false;
      pairs = await generatePairs(app)

    } else {
      pairs = shiftByOne()
    }

    if (pairs) {
      await startConversations(app, pairs)
      console.log("wow we're nasty - started convo")
    }

    pairingDate = currDate
    isCheckedIn = false;
  } else { // @ts-ignore
    if (!isCheckedIn && Math.abs(currDate - pairingDate) > ONE_WEEK_MS) { // TODO: this ts-ignore feels wrong, one week check in
      await sendCheckInDM(app)
      isCheckedIn = true;
      console.log("lfg - sent check in")
    }
  }
}, ONE_WEEK_MS);

