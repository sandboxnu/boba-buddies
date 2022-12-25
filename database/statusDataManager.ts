import { DB_CLIENT } from "./dbConfig";

const STATUS_TABLE: string = "boba-buddies-status";
const STATUS_ID: string = "CURRENT_STATUS";

export class StatusDataManager {
	async getStatus(): Promise<boolean> {
		const getParam = {
			TableName: STATUS_TABLE
		}

		const result = await DB_CLIENT.scan(getParam).promise();

		return result.Items.map((item: any) => item.weeklyStatus).every(Boolean);
	}

	async putStatus(oldStatus: boolean): Promise<void> {
		const putParam = {
			TableName: STATUS_TABLE,
			Item: {
				"weeklyStatus": STATUS_ID,
				"shouldPair": !oldStatus
			}
		}

		return await DB_CLIENT.putItem(putParam).promise();
	}
}