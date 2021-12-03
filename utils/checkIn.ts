import { App } from "@slack/bolt";
import { ChatPostMessageResponse, ConversationsHistoryResponse } from "@slack/web-api";
import fs from 'fs';
import { BOT_USER_ID } from "./generatePairs";

require('dotenv').config();

export const checkIn = async (app: App) => {
    // TODO: set this env variable before deploy
    const pairingsPath = <string>process.env.PAIRINGS_PATH;
    let pairsJson = fs.readFileSync(pairingsPath, {encoding: 'utf8'});
    let channelAndPairs: Map<string, string[]> = new Map(JSON.parse(pairsJson));

    for (const [channelId, pair] of channelAndPairs.entries()) {
        const historyResponse: ConversationsHistoryResponse = await app.client.conversations.history({channel: channelId});
        if(!historyResponse.ok) {
            console.log(`Conversation history could not be opened. Error: ${historyResponse.error}`)
        }
     
        if (historyResponse.messages) {
            const userMessages = historyResponse.messages.filter(message => message.user !== BOT_USER_ID);
            if (userMessages.length > 0) {
                const goodJobMessageResponse: ChatPostMessageResponse = await app.client.chat.postMessage({channel: channelId, text: 'Thank you for talking to each other!!!'});
                if(!goodJobMessageResponse.ok) {
                    console.log(`Message could not be posted. Error: ${goodJobMessageResponse.error}`)
                }
            }
            else {
                const userToPing = pair[Math.floor(Math.random() * channelAndPairs.size)];
                const pleaseTalkMessageResponse: ChatPostMessageResponse = await app.client.chat.postMessage({channel: channelId, text: `SAY SOMETHING NOW <@${userToPing}>!!`});
                if(!pleaseTalkMessageResponse.ok) {
                    console.log(`Message could not be posted. Error: ${pleaseTalkMessageResponse.error}`)
                }
            }
        }
    }
}
