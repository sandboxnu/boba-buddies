import { App } from "@slack/bolt";

//TODO: change this to actual channel id when deploying
const TESTING_CHANNEL_ID = "C02J6R0SUSX";
const ACTUAL_CHANNEL_ID = "C040PKXP5GD";
export const BOT_USER_ID = "U02J904RH1S";

export const generatePairs = async (app: App) => {
    const membersResponse = await app.client.conversations.members({channel: ACTUAL_CHANNEL_ID})
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

// Shift the first person in each group to create new pairs
export const shiftByOne = (): string[][]  => {
  let prevPairings = require('./data/pairings.json');
  let lastPairings: string[][] = Object.values(prevPairings)

  // get first person in each pairing
  const firstPersonList = lastPairings.map((pair: string[]) => pair[0])

  // get odd group
  const oddGroup = lastPairings.filter((pair: string[]) => pair.length === 3)[0]

  // put first person at end of list (shifting everyone up one)
  const firstElem = firstPersonList.shift()
  if (firstElem) {  // TODO: TS is being a whore about this
    firstPersonList.push(firstElem)
  }

  // update pairings with new first person
  lastPairings = lastPairings.map((pairs: string[], ind: number) => [firstPersonList[ind], pairs[1]])

  // get last person
  let oddPersonOut: string;
  if (oddGroup) {
    oddPersonOut = oddGroup[2];
    const oddPersonIndex = Math.floor(Math.random() * lastPairings.length);
    const newOddPairing = lastPairings[oddPersonIndex];
    newOddPairing.push(oddPersonOut);
    [newOddPairing[0], newOddPairing[2]] = [newOddPairing[2], newOddPairing[0]]
  }

  return lastPairings;
}

module.exports = {
  shiftByOne, generatePairs
}
