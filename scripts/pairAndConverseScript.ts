import { appConfig } from '../appConfig';
import { generatePairs } from '../utils/generatePairs';
import { startConversations } from '../utils/startConversations';


const yeet = async () => {
	let pairList = await generatePairs(appConfig);
	await startConversations(appConfig, pairList);
}

yeet();