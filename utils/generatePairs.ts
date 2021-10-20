import { App } from "@slack/bolt";

//TODO: change this to actual channel id when deploying
const TESTING_CHANNEL_ID = "C02J6R0SUSX";
const BOT_USER_ID = "U02J904RH1S";

const generatePairs = async (app: App) => {
    const membersResponse = await app.client.conversations.members({channel: TESTING_CHANNEL_ID})
    const memberIDs = membersResponse.members?.filter(userID => userID !== BOT_USER_ID) as string[]
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

    // only works if we're doing pairs
    // if someone is lonely, then group that person with an existing pair
    if (pairs.length > 1 && pairs.length * 2 !== memberIDs.length) {
        const lonelyMember: string[] = pairs.pop() ?? [];
        const lastPair: string[] = pairs.pop() ?? [];
        const newPair = lastPair.concat(lonelyMember);
        pairs.push(newPair);
    }

    return pairs;
}

export default generatePairs;