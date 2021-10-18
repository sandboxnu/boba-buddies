import { App } from "@slack/bolt";

const TESTING_CHANNEL_ID = "C02J6R0SUSX";
const BOT_USER_ID = "";

const generatePairs = async (app: App) => {
    const membersResponse = await app.client.conversations.members({channel: TESTING_CHANNEL_ID})
    const memberIDs = membersResponse.members?.filter(userID => userID !== BOT_USER_ID)
    // TODO: pair users and return list of pairs
}

export default generatePairs;