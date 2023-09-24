import { DB_CLIENT } from "./dbConfig";

const USERS_TABLE: string = "boba-buddies-users";

export class UsersDataManager {
	async getUsers(): Promise<string[]> {
		const params = {
			TableName: USERS_TABLE
		};
		const slackUsers = await DB_CLIENT.scan(params).promise();

		return slackUsers.Items.map((item: any) => item.slackUserId);
	}

	async addUser(slackUserId: string): Promise<void> {
		const params = {
			TableName: USERS_TABLE,
			Item: {
				"slackUserId": slackUserId
			}
		}

		return await DB_CLIENT.put(params).promise();
	}

	async delete(slackUserId: string): Promise<void> {
		const params = {
			TableName: USERS_TABLE,
			Key: {
				slackUserId: slackUserId
			}
		}

		return await DB_CLIENT.delete(params).promise();
	}

	async deleteAllUsers(): Promise<void> {
		const users: string[] = await this.getUsers();
		for (const id of users) {
			await this.delete(id);
		}

		return;
	}

	async syncUsersTable(usersFromSlack: string[]): Promise<string[]> {
		const usersFromDb: string[] = await this.getUsers();
		if (usersFromDb.length === 0) {
			console.log("LOG INFO: there are no users in the DB, so now we populate with the slack users: ", usersFromSlack);
			for(const user of usersFromSlack) {
				await this.addUser(user);
			}
		}

		const newUsersFromDb: string[] = await this.getUsers();
		const toAdd: string[] = usersFromSlack.filter(user => !newUsersFromDb.includes(user));
		const toDelete: string[] = newUsersFromDb.filter(user => !usersFromSlack.includes(user));
		if (toAdd.length > 0) {
			for (const user of toAdd) {
				await this.addUser(user);
			}
		}

		if (toDelete.length > 0) {
			for (const user of toDelete) {
				await this.delete(user);
			}
		}

		return this.getUsers();
	}
}
