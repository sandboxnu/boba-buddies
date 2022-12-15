import { DB_CLIENT } from "./dbConfig";

const POOL_TABLE: string = "boba-buddies-pool";

export class PoolDataManager {
	async getPool(): Promise<Map<string, string>[]> {
		const params = {
			TableName: POOL_TABLE
		};

		const result = await DB_CLIENT.scan(params).promise();
		return result.Items;
	}

	async getPoolForUser(user: string): Promise<Map<string, string>[]>  {
		const getFilteredParams = {
			TableName: POOL_TABLE,
			FilterExpression: "(primaryBuddy = :primary) OR (secondaryBuddy = :secondary)",
			ExpressionAttributeValues: {
				":primary": user,
				":secondary": user
			}
		}
		const result = await DB_CLIENT.scan(getFilteredParams).promise();
		return result.Items;
	}

	async addPair(slackUser1: string, slackUser2: string): Promise<void> {
		const params = {
			TableName: POOL_TABLE,
			Item: {
				"primaryBuddy": slackUser1,
				"secondaryBuddy": slackUser2
			}
		}

		return await DB_CLIENT.put(params).promise();
	}

	async deletePair(pair: Map<string, string>): Promise<void> {
		const delParams = {
				TableName: POOL_TABLE,
				Key: {
					primaryBuddy: pair.get("primaryBuddy"),
					secondaryBuddy: pair.get("secondaryBuddy")
				}
			}
		return await DB_CLIENT.delete(delParams).promise();
	}

	async popPair(user: string, alreadyPairedList: string[]): Promise<Map<string, string>> {
		const userPool = await this.getPoolForUser(user);
		const unusedUserPool = userPool.filter(unusedPair => !this.containsAny(alreadyPairedList, unusedPair));
		const randomPair = unusedUserPool[Math.floor(Math.random() * unusedUserPool.length)];
		await this.deletePair(new Map(Object.entries(randomPair)));

		return randomPair;
	}

	async syncPool(oldSlackUsers: string[], newSlackUsers: string[]): Promise<void> {
		const currPool: Map<string, string>[] = await this.getPool();
		if (currPool.length === 0) {
			console.log("LOG INFO: the current pool is empty, so now we will populate the pool with all pairings");
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
					await this.deletePair(new Map(Object.entries(pairToDelete)));
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
	
	private containsAny(listToCheck: string[], pair: Object): boolean {
		const values = Object.values(pair);
		return values.some(value => listToCheck.includes(value));
	}
}