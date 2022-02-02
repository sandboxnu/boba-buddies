import { App } from "@slack/bolt";
import lastPairings from './lastPairing.json';

//TODO: change this to actual channel id when deploying
const TESTING_CHANNEL_ID = "C02J6R0SUSX";
export const BOT_USER_ID = "U02J904RH1S";

export const generatePairs = async (app: App) => {
    const membersResponse = await app.client.conversations.members({channel: TESTING_CHANNEL_ID})
    const memberIDs = shuffle(membersResponse.members?.filter((userID: string) => userID !== BOT_USER_ID) as string[])
    const pairs: string[][] = [];

    // we shouldn't start any multiuser channels with just a singular person lol
    if (memberIDs.length == 1) {
        return pairs;
    }

    //copy pasta internet go brrr
    for (let i = 0; i < memberIDs.length; i += 2) {
        const chunk = memberIDs.slice(i, i + 2);
        pairs.push(chunk);
    }

    // if someone is lonely, then group that person with an existing pair
    if (pairs.length > 1 && pairs.length * 2 !== memberIDs.length) {
        const lonelyMember: string[] = pairs.pop() ?? [];
        const lastPair: string[] = pairs.pop() ?? [];
        const newPair = lastPair.concat(lonelyMember);
        pairs.push(newPair);
    }

    return pairs;
}

// stackoverflow said fisher-yates good shuffle algorithm, so i copy pasta away
function shuffle(array: string[]): string[] {
  let m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

export const shiftByOne = (): string[][]  => {
  const firstPersonList = lastPairings.map((pairs) => pairs[0])

  const firstElem = firstPersonList.shift()
  if (firstElem) {
    firstPersonList.push(firstElem)
  }

  const modifiedPairings = lastPairings.map((pairs, ind) => [firstPersonList[ind], pairs[1]])

  let json = JSON.stringify(modifiedPairings);
  let fs = require('fs');
  fs.writeFile('lastPairing.json', json, (err: Error) => {
    console.log('get fucked', err)
  });

  return modifiedPairings;
}

module.exports = {
  shiftByOne, generatePairs
}
