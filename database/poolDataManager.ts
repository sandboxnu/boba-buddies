import { DB_CLIENT } from "./dbConfig";

const POOL_TABLE: string = "boba-buddies-pool";

export class PoolDataManager {
	async getPool(): Promise<Map<string, string>[]> {
		const params = {
			TableName: POOL_TABLE
		};
		return await DB_CLIENT.scan(params).promise();
	}

	async getPoolForUser(user: string): Promise<Map<string, string>[]>  {
		const getPrimaryParams = {
			TableName: POOL_TABLE,
			FilterExpression: "primary = :primary",
			ExpressionAttributeValues: {
				":primary": {S: user}
			}
		}
		const getSecondaryParams = {
			TableName: POOL_TABLE,
			FilterExpression: "secondary = :secondary",
			ExpressionAttributeValues: {
				":secondary": {S: user}
			}
		}
		const primaryPool = await DB_CLIENT.scan(getPrimaryParams).promise();
		const secondaryPool = await DB_CLIENT.scan(getSecondaryParams).promise();
		return [...primaryPool, ...secondaryPool];
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

	async deletePair(pair: Map<string, string>): Promise<void> {
		for(const [slackUser1, slackUser2] of pair) {
			const delParams = {
				TableName: POOL_TABLE,
				Key: {
					primary: slackUser1,
					secondary: slackUser2
				}
			}
			await DB_CLIENT.delete(delParams).promise()
		}

		return;
	}

	async popPair(user: string): Promise<Map<string, string>> {
		const userPool = await this.getPoolForUser(user);
		const randomPair = userPool[Math.floor(Math.random() * userPool.length)];
		await this.deletePair(randomPair);

		return randomPair;
	}

	async syncPool(oldSlackUsers: string[], newSlackUsers: string[]): Promise<void> {
		const currPool: Map<string, string>[] = await this.getPool();
		if (currPool.length === 0) {
			await this.permuteAndAddPairs(newSlackUsers);
		}

		const toAdd = newSlackUsers.filter(user => !oldSlackUsers.includes(user));
		const toDelete: string[] = oldSlackUsers.filter(user => !newSlackUsers.includes(user));

		if (toAdd.length > 0) {
			const currentExistingMembers: string[] = newSlackUsers.filter(user => !toAdd.includes(user));
			for (const toAddSlackUser of toAdd) {
				for (const currentMember of currentExistingMembers) {
					await this.addPair(toAddSlackUser, currentMember);
				}
			}

			await this.permuteAndAddPairs(toAdd);
		}

		if (toDelete.length > 0) {
			for(const toDeleteUser of toDelete) {
				const pairsToDelete: Map<string, string>[] = await this.getPoolForUser(toDeleteUser);
				for (const pairToDelete of pairsToDelete) {
					await this.deletePair(pairToDelete);
				}
			}
		}

		return;
	}

	private async permuteAndAddPairs(slackUsers: string[]): Promise<void> {
		for (var i: number = 0; i < slackUsers.length; i++) {
			for (var j:number = i + 1; j < slackUsers.length; j++) {
				await this.addPair(slackUsers[i], slackUsers[j]);
			}
		}
	}
}