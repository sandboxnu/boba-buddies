import { App } from "@slack/bolt";

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

export const shiftByOne = async (): Promise<string[][]>  => {
  const fs = require('fs');
  let lastPairings = require('./data/lastPairings.json');

  // get first person in each pairing
  const firstPersonList = lastPairings.map((pairs: string[]) => pairs[0])

  // put first person at end of list (shifting everyone up one)
  const firstElem = firstPersonList.shift()
  if (firstElem) {
    firstPersonList.push(firstElem)
  }

  // update pairings with new first person
  lastPairings = lastPairings.map((pairs: string[], ind: number) => [firstPersonList[ind], pairs[1]])

  try {
    fs.writeFileSync('./utils/data/lastPairings.json', JSON.stringify(lastPairings, null, 2), 'utf-8');
  } catch (err) {
    console.error(err)
  }

  return lastPairings;
}

module.exports = {
  shiftByOne, generatePairs
}
