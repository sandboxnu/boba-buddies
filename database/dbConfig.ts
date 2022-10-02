const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
	region: process.env.DB_DEFAULT_REGION,
	accessKeyId: process.env.DB_ACCESS_KEY_ID,
	secretAccessKey: process.env.DB_SECRET_ACCESS_KEY
});

export const DB_CLIENT = new AWS.DynamoDB.DocumentClient();
const POOL_TABLE: string = "boba-buddies-pool";