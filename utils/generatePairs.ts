import { App } from "@slack/bolt";
import { UsersDataManager } from "../database/usersDataManager";
import { PoolDataManager } from "../database/poolDataManager";

const CHANNEL_ID = "C04GHB54U30";
export const BOT_USER_ID = "U02J904RH1S";
const userManager = new UsersDataManager();
const poolManager = new PoolDataManager();

export const generatePairs = async (app: App) => {
    const membersResponse = await app.client.conversations.members({channel: CHANNEL_ID})
    const memberIDs: string[] = membersResponse.members?.filter((userID: string) => userID !== BOT_USER_ID) as string[]
    const oldUserList: string[] = await userManager.getUsers();
    const usersFromDb: string[] = shuffle(await userManager.syncUsersTable(memberIDs));
    await poolManager.syncPool(oldUserList, usersFromDb);
    const pairs: string[][] = [];

    // we shouldn't start any multiuser channels with just a singular person lol
    if (usersFromDb.length == 1) {
        return pairs;
    }

    // retrieve pairings from the pool for every user in usersToBePaired list
    let usersToBePaired: string[] = [...usersFromDb];
    let usersAlreadyPaired: string[] = [];
    while (usersToBePaired.length > 0) {
      // pop the user and get the user's pairing for this cycle
      const primaryUser = usersToBePaired.pop() ?? "";
      const pairMapObject = await poolManager.popPair(primaryUser, usersAlreadyPaired);

      // get the buddy from pairing to remove from usersToBePaired list
      const secondaryUser = getBuddy(primaryUser, new Map(Object.entries(pairMapObject)));
      usersToBePaired = usersToBePaired.filter(user => user !== secondaryUser);
      usersAlreadyPaired.push(primaryUser);
      usersAlreadyPaired.push(secondaryUser);

      // add pairing for user and buddy into returned list
      pairs.push(Object.values(pairMapObject));

      // if someone is lonely, then group that person with an existing pair
      if (usersToBePaired.length === 1) {
        const lonelyMember: string = usersToBePaired.pop() ?? "";
        const lastPair: string[] = pairs.pop() ?? [];
        const newPair = lastPair.concat([lonelyMember]);

        pairs.push(newPair);
      }
    }

    return pairs;
}

function getBuddy(user: string, pair: Map<string, string>): string {
  const primaryBuddy = pair.get("primaryBuddy") ?? "";
  const secondaryBuddy = pair.get("secondaryBuddy") ?? "";

  if (primaryBuddy === user) {
    return secondaryBuddy;
  } else {
    return primaryBuddy;
  }
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
