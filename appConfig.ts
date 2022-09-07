import { App } from '@slack/bolt';
require('dotenv').config();

// Initializes your app with your bot token and signing secret
export const appConfig = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, 
  appToken: process.env.SLACK_APP_TOKEN 
});