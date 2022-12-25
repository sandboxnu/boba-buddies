import { appConfig } from '../appConfig';
import { sendCheckInDM } from '../utils/buttons';
import { generatePairs } from '../utils/generatePairs';
import { startConversations } from '../utils/startConversations';
import { StatusDataManager } from '../database/statusDataManager';

const interactWithBuddies = async () => {
	// TODO: need to test status
	const statusManager = new StatusDataManager();
	await statusManager.putStatus(false);
	
	const shouldPair = await statusManager.getStatus();
	console.log(shouldPair ? "LOG INFO: PAIRING for this week" : "LOG INFO: CHECKING IN for this week");

	// if (shouldPair) {
	// 	let pairList = await generatePairs(appConfig);
	// 	console.log("LOG INFO: pairings for this run is done: ", pairList);

	// 	await startConversations(appConfig, pairList);
	// 	console.log("LOG INFO: started conversations with the pairings");
	// } else {
	// 	await sendCheckInDM(appConfig);
	// 	console.log("LOG INFO: sent midpoint checkin to all group dms");
	// }
}

interactWithBuddies();