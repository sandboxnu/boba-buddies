import { DB_CLIENT } from "./dbConfig";

const PAIRS_TABLE: string = "boba-buddies-pairs";

export class PairsDataManager {
	async getCurrentPairs(): Promise<Map<string, string[]>> {
		const params = {
			TableName: PAIRS_TABLE
		};
		const result = await DB_CLIENT.scan(params).promise();
		const channelAndPairsMap = new Map<string, string[]>();
		for(const item of result.Items) {
			channelAndPairsMap.set(item.channelId, item.slackUserIds);
		}

		return channelAndPairsMap;
	}

	async addPairs(channelId: string, slackUserIds: string[]): Promise<void> {
		const params = {
			TableName: PAIRS_TABLE,
			Item: {
				"channelId": channelId,
				"slackUserIds": slackUserIds
			}
		}

		return await DB_CLIENT.put(params).promise();
	}

	async deleteAllPairs(): Promise<void> {
		const channelPairs: Map<string, string[]> = await this.getCurrentPairs();
		for(const channelId of channelPairs.keys()) {
			const params = {
				TableName: PAIRS_TABLE,
				Key: {
					channelId: channelId
				}
			}

			await DB_CLIENT.delete(params).promise();
		}

		return;
	}
}