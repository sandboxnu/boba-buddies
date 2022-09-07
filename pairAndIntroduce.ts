import { appConfig } from './appConfig';
import { generatePairs, shiftByOne } from './utils/generatePairs';
import { startConversations } from './utils/startConversations';
import { sendCheckInDM } from './utils/buttons';

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
      pairs = await generatePairs(appConfig)

    } else {
      pairs = shiftByOne()
    }

    if (pairs) {
      await startConversations(appConfig, pairs)
      console.log("wow we're nasty - started convo")
    }

    pairingDate = currDate
    isCheckedIn = false;
  } else { // @ts-ignore
    if (!isCheckedIn && Math.abs(currDate - pairingDate) > ONE_WEEK_MS) { // TODO: this ts-ignore feels wrong, one week check in
      await sendCheckInDM(appConfig)
      isCheckedIn = true;
      console.log("lfg - sent check in")
    }
  }
}, ONE_WEEK_MS);

