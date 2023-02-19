import { appConfig } from '../appConfig';
import { sendCheckInDM } from '../utils/buttons';
import { generatePairs } from '../utils/generatePairs';
import { startConversations } from '../utils/startConversations';
import { StatusDataManager } from '../database/statusDataManager';

const interactWithBuddies = async () => {
	const statusManager = new StatusDataManager();
	
	const shouldPair = await statusManager.getStatus();
	console.log(shouldPair 
		? "LOG INFO: PAIRING will happen for this week" 
		: "LOG INFO: CHECKING IN will happen for this week");

	if (shouldPair) {
		let pairList = await generatePairs(appConfig);
		console.log("LOG INFO: pairings for this run is done: ", pairList);

		await startConversations(appConfig, pairList);
		console.log("LOG INFO: started conversations with the pairings");
	} else {
		await sendCheckInDM(appConfig);
		console.log("LOG INFO: sent midpoint checkin to all group dms");
	}

	await statusManager.putStatus(shouldPair);
}

interactWithBuddies();