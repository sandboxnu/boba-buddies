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

let pairingDate = new Date(1652733304000);
setInterval(() => {
  console.log('gets into interval')
  /*
 TODO: implement garbage here
 - check date relative to pairing date
 - someone figure out how to set some timer so this process doesn't run 10 times a second
 */

// TODO: this should not be this lmao
  const firstPairing = true

  const currDate = new Date();

  console.log('previous date' + pairingDate)
  console.log('current date' + currDate)

  // @ts-ignore
  if (Math.abs(currDate - pairingDate) > (604800000 * 2)) { // Two weeks, re-gen pairs
    console.log('its been two weeks')
    let pairs;
    if (firstPairing) {
      generatePairs(app).then(r => pairs = r)
    } else {
      pairs = shiftByOne()
    }

    if (pairs) {
      console.log('success')
      startConversations(app, pairs).then(() => console.log("wow we're nasty - started convo"))
    }

    pairingDate = currDate
  } else { // @ts-ignore
    if (Math.abs(currDate - pairingDate) > 604800000) { // TODO: this ts-ignore feels wrong, one week check in
      console.log('its been one week')
      sendCheckInDM(app).then(() => console.log("lfg - sent check in"))
    }
  }
}, 3 * 1000);

