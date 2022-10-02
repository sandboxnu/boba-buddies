import { DB_CLIENT } from "./dbConfig";

const POOL_TABLE: string = "boba-buddies-pool";

export class PoolDataManager {
	async getPool(): Promise<Map<string, string>> {
		const params = {
			TableName: POOL_TABLE
		};
		return await DB_CLIENT.scan(params).promise();
	}

	async addPair(slackUser1: string, slackUser2: string): Promise<void> {
		const params = {
			TableName: POOL_TABLE,
			Item: {
				"primary": slackUser1,
				"secondary": slackUser2
			}
		}

		return await DB_CLIENT.put(params).promise();
	}

	async popPair(primary: string): Promise<void> {
		const getParams = {
			TableName: POOL_TABLE,
			FilterExpression: "primary = :primary",
			ExpressionAttributeValues: {
				":primary": {S: primary}
			}
		}
		const result = await DB_CLIENT.scan(getParams).promise();
		const randomPair = result.Items;

		const delParams = {
			TableName: POOL_TABLE,
			Key: {
				primary: primary,
				secondary: randomPair.secondary
			}
		}

		await DB_CLIENT.delete(delParams).promise();

		return randomPair;
	}
}