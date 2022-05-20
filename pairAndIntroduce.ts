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

/*
 TODO: implement garbage here
 - check date relative to pairing date
 - someone figure out how to set some timer so this process doesn't run 10 times a second
 */

// TODO: this should not be this lmao
let pairingDate = new Date();
const firstPairing = true

const currDate = new Date();

// @ts-ignore
if (Math.abs(currDate - pairingDate) > 60480000 * 2) { // Two weeks, re-gen pairs
  let pairs;
  if (firstPairing) {
    generatePairs(app).then(r => pairs = r)
  } else {
    pairs = shiftByOne()
  }

  if (pairs) {
    startConversations(app, pairs).then(r => console.log("wow we're nasty - started convo"))
  }

  pairingDate = currDate
} else { // @ts-ignore
  if (Math.abs(currDate - pairingDate) > 60480000) { // TODO: this ts-ignore feels wrong, one week check in
    sendCheckInDM(app).then(r => console.log("lfg - sent check in"))
  }
}

