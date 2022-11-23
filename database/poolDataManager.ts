import { DB_CLIENT } from "./dbConfig";

const POOL_TABLE: string = "boba-buddies-pool";

export class PoolDataManager {
	async getPool(): Promise<Map<string, string>[]> {
		const params = {
			TableName: POOL_TABLE
		};
		return await DB_CLIENT.scan(params).promise();
	}

	async getPoolForUser(primary: string): Promise<Map<string, string>[]>  {
		const getParams = {
			TableName: POOL_TABLE,
			FilterExpression: "primary = :primary",
			ExpressionAttributeValues: {
				":primary": {S: primary}
			}
		}
		return await DB_CLIENT.scan(getParams).promise();
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

	async popPair(primary: string): Promise<Map<string, string>> {
		const getParams = {
			TableName: POOL_TABLE,
			FilterExpression: "primary = :primary",
			ExpressionAttributeValues: {
				":primary": {S: primary}
			}
		}
		const result = await DB_CLIENT.scan(getParams).promise();
		//TODO: fix this shit
		const randomPair = result.Items;

		// TODO: i think i need to fix this
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

	async syncPool(slackUsers: string[], toAdd: string[], toDelete: string[]): Promise<void> {
		const currPool: Map<string, string>[] = await this.getPool();
		if (currPool.length === 0) {
			this.permuteAndAddPairs(slackUsers);
		}

		if (toAdd.length > 0) {
			// TODO: need to add
		}

		if (toDelete.length > 0) {
			for(const toDeleteUser of toDelete) {
				const pairsToDelete: Map<string, string>[] = await this.getPoolForUser(toDeleteUser);
				for(const [primary, secondary] of pairsToDelete) {
					const delParams = {
						TableName: POOL_TABLE,
						Key: {
							primary: primary,
							secondary: secondary
						}
					}

				await DB_CLIENT.delete(delParams).promise();
				}
			}
		}
	}

	private async permuteAndAddPairs(slackUsers: string[]): Promise<void> {
		for (var i: number = 0; i < slackUsers.length; i++) {
			for (var j:number = i + 1; j < slackUsers.length; j++) {
				await this.addPair(slackUsers[i], slackUsers[j]);
			}
		}
	}
}