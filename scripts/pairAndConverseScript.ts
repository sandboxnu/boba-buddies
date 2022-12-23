import { appConfig } from '../appConfig';
import { generatePairs } from '../utils/generatePairs';
import { startConversations } from '../utils/startConversations';

const yeet = async () => {
	let pairList = await generatePairs(appConfig);
	console.log("LOG INFO: pairings for this run is done: ", pairList);
	await startConversations(appConfig, pairList);
	console.log("LOG INFO: started conversations with the pairings");
}
	
yeet();